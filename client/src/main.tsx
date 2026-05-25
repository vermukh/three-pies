import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@fontsource-variable/golos-text";
import "@three-pies/ui-kit/styles.css";
import "./styles.css";
import "./mobile.css";

const UIKitPage = React.lazy(() => import("./UIKitPage"));
const showUIKit =
  new URLSearchParams(window.location.search).get("view") === "ui-kit";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <React.Suspense fallback={<p role="status">Загружаем…</p>}>
      {showUIKit ? <UIKitPage /> : <App />}
    </React.Suspense>
  </React.StrictMode>,
);
