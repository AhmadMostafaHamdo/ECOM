import React, { useEffect, useState } from "react";
import { loaderManager } from "../../utils/loaderManager";
import "./GlobalLoader.css";

const GlobalLoader = () => {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = loaderManager.subscribe((loadingState) => {
            setIsLoading(loadingState);
        });

        return unsubscribe;
    }, []);

    if (!isLoading) return null;

    return (
        <div className="global-loader-overlay">
            <div className="global-loader-container">
                <div className="loader-ring"></div>
                <div className="loader-ring"></div>
                <div className="loader-ring"></div>
                <span className="loader-text">Loading...</span>
            </div>
        </div>
    );
};

export default GlobalLoader;
