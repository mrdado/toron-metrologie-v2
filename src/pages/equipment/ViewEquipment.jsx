import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ArrowLeft, Edit, Download, Share2, Upload } from 'lucide-react';
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
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header / Top Bar */}
            <div className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
                <button
                    onClick={() => navigate('/equipements/edit')}
                    className="flex items-center gap-2 text-gray-600 font-medium"
                >
                    <ArrowLeft size={20} />
                    Retour
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate(`/equipements/edit/${id}`)}
                        className="btn btn-outline btn-sm"
                    >
                        <Edit size={16} />
                        Modifier
                    </button>
                </div>
            </div>

            <div className="max-w-xl mx-auto p-4 space-y-6">
                {/* Info Card */}
                <div className="card bg-white shadow-md border-t-4 border-teal-500">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Détails de l'Équipement
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase">Nom</p>
                            <p className="font-medium text-gray-900">{equipment?.nom}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase">Numéro de Série</p>
                            <p className="font-medium text-gray-900">{equipment?.numeroSerie || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase">Type</p>
                            <span className="badge badge-green inline-block">
                                {equipment?.type}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase">ID Unique</p>
                            <p className="text-xs font-mono text-gray-500 truncate">{id}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase">Date d'étalonnage</p>
                            <p className="text-sm font-medium text-gray-900">{equipment?.dateCalibration || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase">Date d'expiration</p>
                            <p className="text-sm font-medium text-red-600">{equipment?.dateExpiration || 'N/A'}</p>
                        </div>

                        {equipment?.etalonnage && (
                            <div className="col-span-2 space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase">Formule d'étalonnage</p>
                                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 italic font-mono">
                                    {equipment.etalonnage}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Certificates Section */}
                <div className="card bg-white shadow-md">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Upload size={20} className="text-teal-600" />
                        Certificats & Documents
                    </h3>

                    {equipment?.certificates && equipment.certificates.length > 0 ? (
                        <div className="space-y-3">
                            {equipment.certificates.map((cert, index) => (
                                <a
                                    key={index}
                                    href={cert.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-teal-50 hover:border-teal-200 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                                            <Upload size={20} />
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
                                                {cert.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {(cert.size / 1024).toFixed(1)} KB
                                            </span>
                                        </div>
                                    </div>
                                    <Download size={20} className="text-gray-400 group-hover:text-teal-600" />
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-6 text-gray-400 italic text-sm">
                            Aucun document joint à cet équipement.
                        </p>
                    )}
                </div>

                {/* QR Code Section */}
                <div className="card bg-white shadow-md text-center">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                        Identification QR Code
                    </h3>
                    <div className="bg-white p-6 rounded-2xl border-2 border-gray-50 inline-block mb-4 shadow-sm">
                        <img
                            src={qrCodeUrl}
                            alt="QR Code"
                            className="w-48 h-48 mx-auto"
                        />
                    </div>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={handleDownload}
                            className="btn btn-outline btn-sm"
                        >
                            <Download size={18} />
                            Enregistrer
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
        </div>
    );
};

export default ViewEquipment;
