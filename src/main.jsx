import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import "./index.css";
import App from "./App";
import { SoundProvider } from "./context/SoundContext";
import { ProfileProvider } from "./context/ProfileContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <SoundProvider>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </SoundProvider>
    </MotionConfig>
  </StrictMode>
);
