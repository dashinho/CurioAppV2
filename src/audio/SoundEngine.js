/**
 * SoundEngine — every sound in the app, synthesized live with the Web Audio API.
 * No audio files. Call init() from a user gesture (browsers require it).
 *
 * Signal flow:
 *   music bus ─┐
 *   sfx bus  ──┼─► master ─► compressor ─► speakers
 *   voice bus ─┤        ▲
 *              └► analyser (drives C.U.R.I.O.'s waveform, still moves when muted)
 *   reverb send ─► convolver (synthetic impulse response) ─► master
 */

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.ambient = null;
    this.voiceLevel = 0;
    this._lastHover = 0;
    this._lastTick = 0;
  }

  get ready() {
    return !!this.ctx;
  }

  /* ---------------------------------------------------------------- */
  /* Setup                                                            */
  /* ---------------------------------------------------------------- */

  init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.9;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 12;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.25;
    this.master.connect(comp).connect(ctx.destination);

    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this._impulse(3.4, 2.6);
    this.reverbSend = ctx.createGain();
    this.reverbSend.gain.value = 0.5;
    this.reverbSend.connect(this.reverb).connect(this.master);

    this.music = ctx.createGain();
    this.music.gain.value = 0.55;
    this.music.connect(this.master);

    this.sfx = ctx.createGain();
    this.sfx.gain.value = 0.85;
    this.sfx.connect(this.master);

    this.voice = ctx.createGain();
    this.voice.gain.value = 0.55;
    this.voice.connect(this.master);

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.5;
    this.voice.connect(this.analyser);

    this.noiseBuffer = this._noise(2.5);
    if (ctx.state === "suspended") ctx.resume();
  }

  setMuted(muted) {
    this.muted = muted;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(muted ? 0 : 0.9, t, 0.08);
  }

  _now() {
    if (!this.ctx) return null;
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx.currentTime;
  }

  _noise(seconds) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  _impulse(seconds, decay) {
    const rate = this.ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  /** One oscillator with a gain envelope. Returns { osc, gain }. */
  _tone({ type = "sine", freq, t, dur, peak = 0.1, attack = 0.005, dest, detune = 0, glideTo, glideTime }) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + (glideTime ?? dur));
    osc.detune.value = detune;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + dur + 0.05);
    return { osc, gain: g };
  }

  /** Burst of filtered noise. */
  _noiseHit({ t, dur, peak = 0.2, type = "bandpass", freq = 1000, q = 1, dest, attack = 0.002 }) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(dest);
    src.start(t, rand(0, 2), dur + 0.05);
    return { src, filter: f, gain: g };
  }

  /* ---------------------------------------------------------------- */
  /* Ambient: warm, low cosmic drone                                  */
  /* ---------------------------------------------------------------- */

  startAmbient() {
    const t = this._now();
    if (t === null || this.ambient) return;
    const ctx = this.ctx;

    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.6, t + 6);
    out.connect(this.music);
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    out.connect(wet).connect(this.reverbSend);

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 360;
    lp.Q.value = 0.9;
    lp.connect(out);

    // Detuned A-based drone: sub, root pair, fifth, octave
    const voices = [
      { f: 27.5, type: "sine", g: 0.22 },
      { f: 55, type: "sawtooth", g: 0.05, detune: -6 },
      { f: 55, type: "sawtooth", g: 0.05, detune: 7 },
      { f: 82.41, type: "triangle", g: 0.07 },
      { f: 110, type: "sine", g: 0.035, detune: 3 },
      { f: 164.81, type: "sine", g: 0.012 },
    ];
    const nodes = [];
    voices.forEach((v) => {
      const o = ctx.createOscillator();
      o.type = v.type;
      o.frequency.value = v.f;
      o.detune.value = v.detune || 0;
      const g = ctx.createGain();
      g.gain.value = v.g;
      o.connect(g).connect(lp);
      o.start(t);
      nodes.push(o);
    });

    // Slow filter breathing
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.045;
    const lfoAmt = ctx.createGain();
    lfoAmt.gain.value = 160;
    lfo.connect(lfoAmt).connect(lp.frequency);
    lfo.start(t);

    // Faint "solar wind": looped noise through a moving bandpass
    const wind = ctx.createBufferSource();
    wind.buffer = this.noiseBuffer;
    wind.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 420;
    bp.Q.value = 0.7;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.035;
    wind.connect(bp).connect(windGain).connect(out);
    wind.start(t);
    const windLfo = ctx.createOscillator();
    windLfo.frequency.value = 0.07;
    const windLfoAmt = ctx.createGain();
    windLfoAmt.gain.value = 220;
    windLfo.connect(windLfoAmt).connect(bp.frequency);
    windLfo.start(t);

    this.ambient = { out, stoppables: [...nodes, lfo, wind, windLfo] };
  }

  stopAmbient(fade = 2) {
    const t = this._now();
    if (t === null || !this.ambient) return;
    const { out, stoppables } = this.ambient;
    out.gain.cancelScheduledValues(t);
    out.gain.setTargetAtTime(0.0001, t, fade / 4);
    stoppables.forEach((n) => n.stop(t + fade + 0.2));
    this.ambient = null;
  }

  /* ---------------------------------------------------------------- */
  /* Voice: robot typing                                              */
  /* ---------------------------------------------------------------- */

  typeTick(char = "a") {
    this.voiceLevel = Math.min(1, this.voiceLevel + 0.45);
    const t = this._now();
    if (t === null) return;
    if (t - this._lastTick < 0.018) return;
    this._lastTick = t;

    // Mechanical relay click
    this._noiseHit({ t, dur: 0.028, peak: rand(0.25, 0.4), freq: rand(2400, 5200), q: 3, dest: this.voice });
    // Low key thock
    this._tone({ type: "triangle", freq: rand(170, 220), t, dur: 0.035, peak: 0.08, dest: this.voice });
    // Occasional telemetry blip on vowels / punctuation
    if (/[aeiouAEIOU.!?]/.test(char) && Math.random() < 0.5) {
      this._tone({
        type: "square",
        freq: pick([880, 1046.5, 1174.7, 1318.5, 1568]),
        t: t + 0.004,
        dur: 0.03,
        peak: 0.025,
        dest: this.voice,
      });
    }
  }

  /** Read C.U.R.I.O.'s waveform (Uint8Array, 128 = silence). */
  readWaveform(target) {
    if (!this.analyser) return false;
    this.analyser.getByteTimeDomainData(target);
    return true;
  }

  /* ---------------------------------------------------------------- */
  /* UI                                                               */
  /* ---------------------------------------------------------------- */

  hover() {
    const t = this._now();
    if (t === null || t - this._lastHover < 0.06) return;
    this._lastHover = t;
    this._tone({ freq: 2100, glideTo: 2600, t, dur: 0.05, peak: 0.035, dest: this.sfx });
  }

  click() {
    const t = this._now();
    if (t === null) return;
    this._tone({ freq: 1500, glideTo: 820, t, dur: 0.08, peak: 0.08, dest: this.sfx });
    this._tone({ freq: 2400, t: t + 0.075, dur: 0.06, peak: 0.04, dest: this.sfx });
    this._noiseHit({ t, dur: 0.02, peak: 0.08, freq: 3500, q: 2, dest: this.sfx });
  }

  /** Radio static crackle for locked archives. */
  staticBurst(dur = 0.35) {
    const t = this._now();
    if (t === null) return;
    const { gain, filter } = this._noiseHit({ t, dur, peak: 0.07, freq: 1700, q: 0.8, dest: this.sfx, attack: 0.01 });
    for (let i = 0; i < 10; i++) {
      gain.gain.setValueAtTime(rand(0.005, 0.09), t + 0.012 + (i * dur) / 11);
    }
    filter.frequency.setValueAtTime(900, t);
    filter.frequency.linearRampToValueAtTime(2600, t + dur);
    this._tone({ type: "sine", freq: 3000, t: t + 0.02, dur: 0.12, peak: 0.01, dest: this.sfx });
  }

  /** Short "access denied" double pip. */
  denied() {
    const t = this._now();
    if (t === null) return;
    this._tone({ type: "square", freq: 440, t, dur: 0.07, peak: 0.03, dest: this.sfx });
    this._tone({ type: "square", freq: 330, t: t + 0.09, dur: 0.1, peak: 0.03, dest: this.sfx });
  }

  /** Paper page turning: a soft swish, a few crinkles, then the page landing. */
  pageTurn(strength = 1) {
    const t = this._now();
    if (t === null) return;
    const { filter } = this._noiseHit({ t, dur: 0.46, peak: 0.14 * strength, type: "bandpass", freq: 700, q: 0.9, dest: this.sfx, attack: 0.1 });
    filter.frequency.setValueAtTime(700, t);
    filter.frequency.exponentialRampToValueAtTime(3200, t + 0.2);
    filter.frequency.exponentialRampToValueAtTime(1100, t + 0.44);
    for (let i = 0; i < 4; i++) {
      this._noiseHit({ t: t + 0.05 + i * 0.07 + rand(0, 0.03), dur: 0.02, peak: 0.04 * strength, freq: rand(3500, 6500), q: 5, dest: this.sfx });
    }
    this._noiseHit({ t: t + 0.4, dur: 0.09, peak: 0.13 * strength, type: "lowpass", freq: 380, q: 0.7, dest: this.sfx });
  }

  /* ---------------------------------------------------------------- */
  /* Travel: low-pass filter sweep whoosh                             */
  /* ---------------------------------------------------------------- */

  whoosh(dur = 2.6) {
    const t = this._now();
    if (t === null) return;
    const ctx = this.ctx;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 9;
    lp.frequency.setValueAtTime(110, t);
    lp.frequency.exponentialRampToValueAtTime(3400, t + dur * 0.55);
    lp.frequency.exponentialRampToValueAtTime(80, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.55, t + dur * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(lp).connect(g);
    g.connect(this.sfx);
    const wet = ctx.createGain();
    wet.gain.value = 0.4;
    g.connect(wet).connect(this.reverbSend);
    src.start(t);
    src.stop(t + dur + 0.1);

    // Sub-bass engine rumble gliding down
    this._tone({ freq: 95, glideTo: 32, glideTime: dur, t, dur, peak: 0.32, attack: dur * 0.35, dest: this.sfx });
    // Doppler-ish whistle
    this._tone({ type: "sine", freq: 320, glideTo: 1400, glideTime: dur * 0.5, t, dur: dur * 0.7, peak: 0.012, attack: dur * 0.3, dest: this.sfx });
  }

  /* ---------------------------------------------------------------- */
  /* Quiz                                                             */
  /* ---------------------------------------------------------------- */

  error() {
    const t = this._now();
    if (t === null) return;
    const ctx = this.ctx;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    lp.connect(this.sfx);
    [0, 0.17].forEach((off) => {
      this._tone({ type: "square", freq: 98, t: t + off, dur: 0.13, peak: 0.09, dest: lp });
      this._tone({ type: "sawtooth", freq: 103.6, t: t + off, dur: 0.13, peak: 0.07, dest: lp });
    });
  }

  chime() {
    const t = this._now();
    if (t === null) return;
    const notes = [659.25, 783.99, 987.77, 1318.51]; // E5 G5 B5 E6
    notes.forEach((f, i) => {
      const s = t + i * 0.075;
      const a = this._tone({ freq: f, t: s, dur: 1.3, peak: 0.09, dest: this.sfx });
      this._tone({ type: "triangle", freq: f * 2, t: s, dur: 0.6, peak: 0.02, dest: this.sfx });
      const wet = this.ctx.createGain();
      wet.gain.value = 0.6;
      a.gain.connect(wet).connect(this.reverbSend);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Stamp: heavy mechanical THUD + shimmering synth chord            */
  /* ---------------------------------------------------------------- */

  stampThud() {
    const t = this._now();
    if (t === null) return;
    const ctx = this.ctx;

    // Body: pitch-dropping kick
    this._tone({ freq: 150, glideTo: 36, glideTime: 0.32, t, dur: 0.7, peak: 0.95, attack: 0.003, dest: this.sfx });
    // Impact: low-passed noise slap
    this._noiseHit({ t, dur: 0.16, peak: 0.6, type: "lowpass", freq: 900, q: 0.7, dest: this.sfx });
    // Metal: inharmonic clank partials
    [311, 727, 1163, 1709, 2390].forEach((f, i) => {
      this._tone({ type: i % 2 ? "square" : "sine", freq: f, t: t + 0.004, dur: 0.28 - i * 0.03, peak: 0.035, dest: this.sfx });
    });
    // Mechanism resetting: three ratchet clicks
    [0.11, 0.16, 0.21].forEach((off) =>
      this._noiseHit({ t: t + off, dur: 0.03, peak: 0.12, freq: 1800, q: 4, dest: this.sfx })
    );

    // Shimmering chord: Cmaj9 spread, detuned saws through an opening filter
    const c = t + 0.16;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 2;
    lp.frequency.setValueAtTime(380, c);
    lp.frequency.exponentialRampToValueAtTime(3200, c + 1.4);
    lp.frequency.exponentialRampToValueAtTime(900, c + 4);
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.0001, c);
    bus.gain.exponentialRampToValueAtTime(0.32, c + 0.35);
    bus.gain.exponentialRampToValueAtTime(0.0001, c + 4.2);
    lp.connect(bus);
    bus.connect(this.sfx);
    const wet = ctx.createGain();
    wet.gain.value = 0.9;
    bus.connect(wet).connect(this.reverbSend);

    [130.81, 261.63, 329.63, 392.0, 493.88, 587.33].forEach((f) => {
      [-8, 8].forEach((d) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = f;
        o.detune.value = d;
        const g = ctx.createGain();
        g.gain.value = 0.05;
        o.connect(g).connect(lp);
        o.start(c);
        o.stop(c + 4.4);
      });
    });

    // Sparkle: high bell tones with tremolo
    const trem = ctx.createOscillator();
    trem.frequency.value = 6.5;
    const tremAmt = ctx.createGain();
    tremAmt.gain.value = 0.015;
    const bell = ctx.createGain();
    bell.gain.value = 0.03;
    trem.connect(tremAmt).connect(bell.gain);
    bell.connect(this.sfx);
    const bellWet = ctx.createGain();
    bellWet.gain.value = 1;
    bell.connect(bellWet).connect(this.reverbSend);
    trem.start(c);
    trem.stop(c + 3.5);
    [1046.5, 1318.5, 1568, 2093].forEach((f, i) => {
      this._tone({ freq: f, t: c + 0.12 + i * 0.09, dur: 2.6, peak: 0.5, attack: 0.01, dest: bell });
    });
  }
}

export const sound = new SoundEngine();
