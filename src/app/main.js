import "maplibre-gl/dist/maplibre-gl.css";
import { injectSpeedInsights } from "@vercel/speed-insights";
import { inject as injectAnalytics } from "@vercel/analytics";
import { initializeApp } from "../controllers/appController";

injectSpeedInsights();
injectAnalytics();

window.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});
