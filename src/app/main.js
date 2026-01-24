import "maplibre-gl/dist/maplibre-gl.css";
import { injectSpeedInsights } from "@vercel/speed-insights";
import { inject as injectAnalytics } from "@vercel/analytics";
import { initializeApp } from "../controllers/appController";

injectSpeedInsights();
injectAnalytics();

const preloadImages = () => {
  const urls = [
    "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Compost_V1.png",
    "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Compost%204.png",
    "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Compost%203.png",
    "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Compost%202.png",
    "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-22%20at%206.39.33%E2%80%AFPM.png",
    "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-23%20at%205.33.51%E2%80%AFPM.png",
    "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-23%20at%205.36.17%E2%80%AFPM.png",
    "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-23%20at%205.36.46%E2%80%AFPM.png",
    "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-24%20at%2011.52.06%E2%80%AFAM.png",
    "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-24%20at%2011.52.39%E2%80%AFAM.png",
    "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-24%20at%2011.52.46%E2%80%AFAM.png",
    "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-22%20at%204.56.47%E2%80%AFPM.png",
    "https://vl7zgyqezaiej8w4.public.blob.vercel-storage.com/Screenshot%202026-01-22%20at%204.56.52%E2%80%AFPM.png",
  ];

  urls.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};

window.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  const schedule = (cb) => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(cb, { timeout: 2000 });
    } else {
      setTimeout(cb, 600);
    }
  };
  schedule(() => preloadImages());
});
