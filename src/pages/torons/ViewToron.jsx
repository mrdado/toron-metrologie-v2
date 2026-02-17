import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { X, Download, Share2, Upload } from 'lucide-react';
import QRCode from 'qrcode';

const ViewToron = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [toron, setToron] = useState(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(db, 'torons', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setToron(docSnap.data());

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
                    alert("Toron introuvable");
                    navigate('/torons/edit');
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
        link.download = `QRCode_Toron_${toron?.identification || id}.png`;
        link.click();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                const blob = await (await fetch(qrCodeUrl)).blob();
                const file = new File([blob], `QRCode_${id}.png`, { type: 'image/png' });
                await navigator.share({
                    files: [file],
                    title: `QR Code - ${toron?.identification || id}`,
                    text: `QR Code pour le toron ${toron?.fournisseur || ''}`
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
                    QR Code - {toron?.identification || id}
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
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        onClick={handleDownload}
                        className="btn btn-outline btn-sm"
                    >
                        <Download size={18} />
                        QR Code
                    </button>
                    <button
                        onClick={handleShare}
                        className="btn btn-dark btn-sm"
                    >
                        <Share2 size={18} />
                        Partager
                    </button>
                </div>

                {/* Certificates Section */}
                {toron?.certificates && toron.certificates.length > 0 && (
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Certificats de Qualité
                        </h3>
                        <div className="space-y-2">
                            {toron.certificates.map((cert, index) => (
                                <a
                                    key={index}
                                    href={cert.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center">
                                            <Upload size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                                                {cert.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {(cert.size / 1024).toFixed(1)} KB
                                            </span>
                                        </div>
                                    </div>
                                    <Download size={18} className="text-gray-400 group-hover:text-blue-500" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewToron;
