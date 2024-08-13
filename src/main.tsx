import { createRoot } from "react-dom/client";
import { setBasePath } from "@shoelace-style/shoelace";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "@shoelace-style/shoelace/dist/themes/light.css";

import { App } from "./app/app";
import { Provider } from "./app/providers";

import "./assets/styles/main.scss";
import "./index.css";
import { Toaster } from "./app/components/ui";


setBasePath(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.14.0/cdn/"
);

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <Provider>
    <App />
    <Toaster duration={10000} position="top-center" closeButton={true} />
    <ToastContainer />
  </Provider>
);
