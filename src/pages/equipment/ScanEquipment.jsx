import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCodeScanner from '../../components/features/QRCodeScanner';
import Button from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

const ScanEquipment = () => {
    const navigate = useNavigate();

    const handleScan = (decodedText) => {
        navigate(`/equipements/view/${decodedText}`);
    };

    return (
        <div className="max-w-md mx-auto text-center space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <Button variant="outline" onClick={() => navigate('/')} className="!p-2">
                    <ArrowLeft size={20} />
                </Button>
                <h2 className="text-2xl font-bold">Scanner Équipement</h2>
            </div>

            <p className="text-gray-500">
                Placez le QR Code de l'équipement devant la caméra.
            </p>

            <div className="bg-white p-4 rounded-xl shadow-sm">
                <QRCodeScanner onScan={handleScan} />
            </div>

            <div className="mt-8">
                <p className="text-sm text-gray-400 mb-2">Impossible de scanner ?</p>
                <Button variant="outline" onClick={() => navigate('/equipements/edit')}>
                    Rechercher manuellement
                </Button>
            </div>
        </div>
    );
};

export default ScanEquipment;
