import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { X, Download, Share2 } from 'lucide-react';
import QRCode from 'qrcode';

const ViewEquipment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(db, 'equipements', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setEquipment(docSnap.data());

                    // Generate QR Code
                    const qrUrl = await QRCode.toDataURL(id, {
                        width: 300,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        }
                    });
                    setQrCodeUrl(qrUrl);
                } else {
                    alert("Équipement introuvable");
                    navigate('/equipements/edit');
                }
            } catch (error) {
                console.error("Erreur:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `QRCode_Equipment_${equipment?.nom || id}.png`;
        link.click();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                const blob = await (await fetch(qrCodeUrl)).blob();
                const file = new File([blob], `QRCode_${id}.png`, { type: 'image/png' });
                await navigator.share({
                    files: [file],
                    title: `QR Code - ${equipment?.nom || id}`,
                    text: `QR Code pour l'équipement ${equipment?.nom || ''}`
                });
            } catch (err) {
                console.log('Partage annulé ou erreur:', err);
            }
        } else {
            alert("Le partage n'est pas supporté sur ce navigateur");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-400">Chargement...</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-fade-in">
                {/* Close Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                {/* Title */}
                <h2 className="text-xl font-bold text-center mb-6">
                    QR Code - {equipment?.nom || id}
                </h2>

                {/* QR Code */}
                <div className="bg-white p-6 rounded-xl border-2 border-gray-100 mb-6">
                    <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="w-full h-auto"
                    />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleDownload}
                        className="btn btn-outline btn-sm"
                    >
                        <Download size={18} />
                        Télécharger
                    </button>
                    <button
                        onClick={handleShare}
                        className="btn btn-dark btn-sm"
                    >
                        <Share2 size={18} />
                        Partager
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewEquipment;
