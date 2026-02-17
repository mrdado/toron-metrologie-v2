import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

const QRCodeScanner = ({ onScan }) => {
    const [scanResult, setScanResult] = useState(null);

    const handleScan = (result) => {
        if (result && result[0]) {
            const decodedText = result[0].rawValue;
            setScanResult(decodedText);
            onScan(decodedText);
        }
    };

    const handleError = (error) => {
        if (error && error.name !== 'NotFoundException') {
            console.error('Scanner error:', error);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            <div className="w-full overflow-hidden rounded-lg shadow-md bg-slate-100">
                <Scanner
                    onScan={handleScan}
                    onError={handleError}
                    constraints={{
                        facingMode: 'environment'
                    }}
                    styles={{
                        container: { width: '100%' },
                        video: { width: '100%', height: 'auto' }
                    }}
                />
            </div>
            {scanResult && (
                <p className="text-center mt-2 text-green-600 font-medium">Scanné avec succès!</p>
            )}
        </div>
    );
};

export default QRCodeScanner;
