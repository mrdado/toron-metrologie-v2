import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Camera, X } from 'lucide-react';

const ScanGlobal = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cameraError, setCameraError] = useState(null);

    const handleScan = async (result) => {
        if (!result || !result[0] || loading) return;

        const decodedText = result[0].rawValue;
        if (!decodedText) return;

        setLoading(true);
        setError('');
        setCameraError(null);

        try {
            // Try Torons first
            const toronRef = doc(db, 'torons', decodedText);
            const toronSnap = await getDoc(toronRef);

            if (toronSnap.exists()) {
                navigate(`/torons/view/${decodedText}`);
                return;
            }

            // Try Equipment
            const equipRef = doc(db, 'equipements', decodedText);
            const equipSnap = await getDoc(equipRef);

            if (equipSnap.exists()) {
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

    const handleError = (error) => {
        if (error) {
            if (error.name === 'NotAllowedError') {
                setCameraError('Accès à la caméra refusé. Veuillez autoriser l\'accès.');
            } else if (error.name !== 'NotFoundException') {
                setCameraError('Erreur de caméra');
            }
        }
    };

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
                        aria-label="Fermer le scanner"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scanner Area */}
                <div className="relative bg-black">
                    <Scanner
                        onScan={handleScan}
                        onError={handleError}
                        constraints={{
                            facingMode: 'environment'
                        }}
                        components={{
                            audio: false,
                            finder: true,
                        }}
                        allowMultiple={false}
                        scanDelay={500}
                    />
                </div>

                {/* Instructions */}
                <div className="p-4 bg-white text-center">
                    <p className="text-gray-600 text-sm">
                        Positionnez le QR Code devant la caméra
                    </p>
                </div>

                {/* Camera Error Display */}
                {cameraError && (
                    <div className="p-4 bg-orange-50 border-t border-orange-100">
                        <p className="text-orange-600 text-sm text-center">{cameraError}</p>
                    </div>
                )}

                {/* Scan Error Display */}
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
