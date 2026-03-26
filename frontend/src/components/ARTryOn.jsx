import React, { useEffect, useRef, useState } from 'react';
import '@google/model-viewer';

/**
 * ARTryOn Component
 * Uses Google's <model-viewer> to render the 3D model and native AR.
 * 
 * @param {string} modelUrl - URL to the .glb / .gltf AR model.
 * @param {string} placement - 'world', 'face', 'body'. For now, defaults to 'world' using WebXR.
 * @param {string} scale - Scale string like '1 1 1'
 * @param {function} onClose - function to close the AR view
 */
export default function ARTryOn({ modelUrl, placement = 'world', scale = '1 1 1', onClose }) {
    const [hasSupport, setHasSupport] = useState(true);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        // Quick check for AR support (highly simplified)
        // model-viewer handles the heavy lifting of showing/hiding the AR button natively,
        // but we can check if it's generally supported.
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isAndroid = /android/i.test(navigator.userAgent);
        const desktopDetect = !isIOS && !isAndroid;
        setIsDesktop(desktopDetect);

        // Model Viewer's native AR mostly works on iOS QuickLook and Android Scene Viewer.
        // It provides a fallback 3D view for Desktop.
        if (desktopDetect) {
            console.log("Desktop detected. Falling back to 3D view instead of native AR.");
        }
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col">
            {/* Header controls */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
                <button
                    onClick={onClose}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-md"
                >
                    <span className="material-icons">close</span>
                </button>
                <div className="text-white font-medium tracking-widest uppercase text-sm">
                    3D / AR View
                </div>
                <div className="w-12" /> {/* Spacer for centered title */}
            </div>

            {/* Model Viewer */}
            <div className="flex-1 w-full h-full relative">
                <model-viewer
                    src={modelUrl}
                    ios-src={modelUrl.replace('.glb', '.usdz')} // Optional: if you have .usdz for iOS fallback
                    alt="A 3D model of the product"
                    ar
                    ar-modes="webxr scene-viewer quick-look"
                    environment-image="neutral"
                    auto-rotate
                    camera-controls
                    scale={scale}
                    style={{ width: '100%', height: '100%' }}
                >
                    {/* Only show AR button on mobile/AR-supported devices */}
                    {!isDesktop && (
                        <button
                            slot="ar-button"
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#800000] text-white px-8 py-4 rounded-full font-bold tracking-widest uppercase shadow-lg hover:bg-[#600000] inline-flex items-center gap-2"
                        >
                            <span className="material-icons">view_in_ar</span>
                            View in your space
                        </button>
                    )}
                    
                    <div id="ar-prompt" className="absolute bottom-32 left-1/2 -translate-x-1/2 animate-bounce bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                        Move your phone to find the floor.
                    </div>
                </model-viewer>
            </div>
        </div>
    );
}
