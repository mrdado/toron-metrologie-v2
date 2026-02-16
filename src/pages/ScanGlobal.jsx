import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Camera, X } from 'lucide-react';

const ScanGlobal = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [scannerStarted, setScannerStarted] = useState(false);

    useEffect(() => {
        let scanner = null;

        const initScanner = () => {
            scanner = new Html5QrcodeScanner(
                "qr-reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                false
            );

            scanner.render(handleScan, handleError);
            setScannerStarted(true);
        };

        const handleScan = async (decodedText) => {
            if (loading) return;
            setLoading(true);
            setError('');

            try {
                // Try Torons first
                const toronRef = doc(db, 'torons', decodedText);
                const toronSnap = await getDoc(toronRef);

                if (toronSnap.exists()) {
                    scanner?.clear();
                    navigate(`/torons/view/${decodedText}`);
                    return;
                }

                // Try Equipment
                const equipRef = doc(db, 'equipements', decodedText);
                const equipSnap = await getDoc(equipRef);

                if (equipSnap.exists()) {
                    scanner?.clear();
                    navigate(`/equipements/view/${decodedText}`);
                    return;
                }

                // Not found
                setError(`Item non trouvé (ID: ${decodedText})`);
                setLoading(false);

            } catch (err) {
                console.error("Error scanning:", err);
                setError("Erreur de lecture: " + err.message);
                setLoading(false);
            }
        };

        const handleError = (err) => {
            // Ignore common camera errors during initialization
            if (err && !err.includes("NotAllowedError")) {
                console.warn("Scanner error:", err);
            }
        };

        // Auto-start scanner
        initScanner();

        return () => {
            if (scanner) {
                scanner.clear().catch(console.error);
            }
        };
    }, [navigate, loading]);

    return (
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
            {/* Scanner Card Overlay */}
            <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="bg-white p-4 flex items-center justify-between border-b">
                    <div className="flex items-center gap-3">
                        <Camera size={24} className="text-gray-700" />
                        <h2 className="text-lg font-bold text-gray-900">Scanner QR Code</h2>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scanner Area */}
                <div className="relative bg-black">
                    <div id="qr-reader" className="w-full"></div>

                    {/* Corner Brackets Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="relative w-64 h-64">
                            {/* Top Left */}
                            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white"></div>
                            {/* Top Right */}
                            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white"></div>
                            {/* Bottom Left */}
                            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white"></div>
                            {/* Bottom Right */}
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white"></div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="p-4 bg-white text-center">
                    <p className="text-gray-600 text-sm">
                        Positionnez le QR Code devant la caméra
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-4 bg-red-50 border-t border-red-100">
                        <p className="text-red-600 text-sm text-center">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="p-4 bg-blue-50 border-t border-blue-100">
                        <p className="text-blue-600 text-sm text-center">Recherche en cours...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanGlobal;
