import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRCodeScanner = ({ onScan, fps = 10 }) => {
    const [scanResult, setScanResult] = useState(null);
    const scannerRef = React.useRef(null);

    useEffect(() => {
        // Prevent double initialization in Strict Mode
        if (scannerRef.current) return;

        scannerRef.current = new Html5QrcodeScanner(
            "reader",
            { fps: fps, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        function onScanSuccess(decodedText, decodedResult) {
            setScanResult(decodedText);
            onScan(decodedText);
            try {
                if (scannerRef.current) {
                    scannerRef.current.clear();
                }
            } catch (ignore) { }
        }

        function onScanFailure(error) {
            // console.warn(`Code scan error = ${error}`);
        }

        scannerRef.current.render(onScanSuccess, onScanFailure);

        // Cleanup
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner. ", error);
                });
                scannerRef.current = null;
            }
        };
    }, [onScan, fps]);

    return (
        <div className="w-full max-w-sm mx-auto">
            <div id="reader" className="w-full overflow-hidden rounded-lg shadow-md bg-slate-100 min-h-[300px]"></div>
            {scanResult && (
                <p className="text-center mt-2 text-green-600 font-medium">Scanné avec succès!</p>
            )}
        </div>
    );
};

export default QRCodeScanner;
