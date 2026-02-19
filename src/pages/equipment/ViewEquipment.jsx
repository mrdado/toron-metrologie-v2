import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ArrowLeft, Edit, Download, Share2, Upload } from 'lucide-react';
import QRCode from 'qrcode';
import TabNav from '../../components/ui/TabNav';

const ViewEquipment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');

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

    const tabs = [
        { id: 'details', label: 'Détails' },
        { id: 'certificates', label: 'Certificats' },
        { id: 'qrcode', label: 'QR Code' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 mb-6">
                <button 
                    onClick={() => navigate('/equipements/edit')} 
                    className="btn btn-equipment btn-sm"
                >
                    <ArrowLeft size={18} />
                    Retour
                </button>
                <button
                    onClick={() => navigate(`/equipements/edit/${id}`)}
                    className="btn btn-equipment btn-sm"
                >
                    <Edit size={18} />
                    Modifier
                </button>
            </div>

            {/* Header */}
            <h1 className="page-header page-header-equipment">
                Détails de l'Équipement
            </h1>

            <div className="max-w-xl mx-auto p-4 mt-2">
                {/* Tab Navigation */}
                <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant="equipment" />

                {/* Tab Content: Details */}
                {activeTab === 'details' && (
                    <div className="card bg-white shadow-lg">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase">Nom</p>
                                <p className="font-medium text-gray-900">{equipment?.nom}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase">Type</p>
                                <span className="badge badge-green inline-block">
                                    {equipment?.type}
                                </span>
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
                )}

                {/* Tab Content: Certificates */}
                {activeTab === 'certificates' && (
                    <div className="card bg-white shadow-md">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Upload size={20} style={{ color: 'var(--equipment-primary)' }} />
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
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all group"
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--equipment-light)'; e.currentTarget.style.borderColor = 'var(--equipment-primary)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#F3F4F6'; }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--equipment-light)', color: 'var(--equipment-primary)' }}>
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
                                        <Download size={20} className="text-gray-400" style={{ color: 'var(--text-muted)' }} />
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-6 text-gray-400 italic text-sm">
                                Aucun document joint à cet équipement.
                            </p>
                        )}
                    </div>
                )}

                {/* Tab Content: QR Code */}
                {activeTab === 'qrcode' && (
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

                        <div className="flex gap-4 justify-center w-full" style={{height: '44px'}}>
                            <button
                                onClick={handleDownload}
                                className="btn btn-outline btn-sm flex-1"
                                style={{height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                            >
                                <Download size={18} />
                                Enregistrer
                            </button>
                            <button
                                onClick={handleShare}
                                className="btn btn-dark btn-sm flex-1"
                                style={{height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                            >
                                <Share2 size={18} />
                                Partager
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewEquipment;
