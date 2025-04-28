import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Leaflet css
const leafletStyles = document.createElement('link');
leafletStyles.rel = 'stylesheet';
leafletStyles.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
leafletStyles.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
leafletStyles.crossOrigin = '';
document.head.appendChild(leafletStyles);

// Set page title
const titleElement = document.createElement('title');
titleElement.textContent = 'ParkWise - Stevens Institute of Technology Parking';
document.head.appendChild(titleElement);

// Set favicon
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.href = 'https://www.stevens.edu/sites/stevens_edu/files/favicon.ico';
document.head.appendChild(favicon);

createRoot(document.getElementById("root")!).render(<App />);
