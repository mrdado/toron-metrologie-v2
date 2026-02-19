import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCodeScanner from '../../components/features/QRCodeScanner';
import Button from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

const ScanToron = () => {
    const navigate = useNavigate();

    const handleScan = (decodedText) => {
        // Navigate to view page with the scanned ID
        navigate(`/torons/view/${decodedText}`);
    };

    return (
        <div className="max-w-2xl mx-auto text-center space-y-6">
            <h1 className="page-header page-header-scanner">
                Scanner Toron
            </h1>

            <p className="text-gray-500">
                Placez le QR Code du toron devant la caméra.
            </p>

            <div className="bg-white p-4 rounded-xl shadow-sm">
                <QRCodeScanner onScan={handleScan} />
            </div>

            <div className="mt-8">
                <p className="text-sm text-gray-400 mb-2">Impossible de scanner ?</p>
                <Button variant="outline" onClick={() => navigate('/torons/edit')}>
                    Rechercher manuellement
                </Button>
            </div>
        </div>
    );
};

export default ScanToron;
