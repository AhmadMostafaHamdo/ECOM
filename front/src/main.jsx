import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Provider } from "react-redux";
import store from "./store";
import { BrowserRouter } from "react-router-dom";
import Contextprovider from "./Components/context/Contextprovider";
import { ThemeProvider } from "./Components/context/ThemeContext";
import ChatProvider from "./Components/context/ChatContext";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
    <ThemeProvider>
        <Contextprovider>
            <ChatProvider>
                <Provider store={store}>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </Provider>
            </ChatProvider>
        </Contextprovider>
    </ThemeProvider>
);
