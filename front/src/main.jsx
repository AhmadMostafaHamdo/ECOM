import React from "react";
import { fetchViaAxios } from "./api";
window.fetch = fetchViaAxios;
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Provider } from "react-redux";
import store from "./store";
import { BrowserRouter } from "react-router-dom";
import Contextprovider from "./Components/context/Contextprovider";
import { ThemeProvider } from "./Components/context/ThemeContext";
import LocalizeProvider from "./Components/context/LocalizeContext";
import ChatProvider from "./Components/context/ChatContext";
import GlobalLoader from "./Components/common/GlobalLoader";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
    <ThemeProvider>
        <LocalizeProvider>
            <Contextprovider>
                <ChatProvider>
                    <Provider store={store}>
                        <BrowserRouter>
                            <GlobalLoader />
                            <App />
                        </BrowserRouter>
                    </Provider>
                </ChatProvider>
            </Contextprovider>
        </LocalizeProvider>
    </ThemeProvider>
);
