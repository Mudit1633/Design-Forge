// ─────────────────────────────────────────────────────────────
//  main.jsx  —  DesignForge React Entry Point
//
//  Responsibilities:
//    • Mount the React application into #root
//    • Wrap App in React.StrictMode for dev warnings
//
//  In a Vite project this file is referenced via:
//    <script type="module" src="/src/main.jsx"></script>
//
//  In the CDN/standalone version (index.html) it is loaded as:
//    <script type="text/babel" src="src/main.jsx"></script>
// ─────────────────────────────────────────────────────────────

// When using Vite / bundler, uncomment these imports:
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
// import './index.css';   // global styles live here if split out

// CDN build — React & ReactDOM are globals from index.html <script> tags.
const { StrictMode } = React;
const { createRoot }  = ReactDOM;

// Mount
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
