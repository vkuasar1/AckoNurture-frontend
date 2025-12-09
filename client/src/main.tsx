import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeUserId } from "./lib/userId";

// Initialize userId on app startup
initializeUserId();

createRoot(document.getElementById("root")!).render(<App />);
