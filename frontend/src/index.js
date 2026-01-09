import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

axios.defaults.baseURL = process.env.REACT_APP_API_URL || "";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
