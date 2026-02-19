import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ArrowLeft, Edit, Download, Share2, Upload } from 'lucide-react';
import QRCode from 'qrcode';
import TabNav from '../../components/ui/TabNav';

const ViewToron = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [toron, setToron] = useState(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');

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
                    onClick={() => navigate('/torons/edit')} 
                    className="btn btn-primary btn-sm"
                >
                    <ArrowLeft size={18} />
                    Retour
                </button>
                <button
                    onClick={() => navigate(`/torons/edit/${id}`)}
                    className="btn btn-primary btn-sm"
                >
                    <Edit size={18} />
                    Modifier
                </button>
            </div>

            {/* Header */}
            <h1 className="page-header page-header-toron">
                Détails du Toron
            </h1>

            <div className="max-w-xl mx-auto p-4 mt-2">
                {/* Tab Navigation */}
                <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Tab Content: Details */}
                {activeTab === 'details' && (
                    <div className="card bg-white shadow-lg">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase">Identification</p>
                                <p className="font-medium text-gray-900">{toron?.identification}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase">Fournisseur</p>
                                <p className="font-medium text-gray-900">{toron?.fournisseur}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase">Diamètre</p>
                                <p className="font-medium text-gray-900">{toron?.diametre}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase">Grade</p>
                                <p className="font-medium text-gray-900">{toron?.grade}</p>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase">Utilisation</p>
                                <p className="font-medium text-gray-900">{toron?.utilisation}</p>
                            </div>
                            {toron?.essais && (
                                <div className="col-span-2 space-y-1">
                                    <p className="text-xs font-semibold text-gray-400 uppercase">Essais</p>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 italic">
                                        "{toron.essais}"
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
                            <Upload size={20} style={{ color: 'var(--toron-primary)' }} />
                            Certificats de Qualité
                        </h3>

                        {toron?.certificates && toron.certificates.length > 0 ? (
                            <div className="space-y-3">
                                {toron.certificates.map((cert, index) => (
                                    <a
                                        key={index}
                                        href={cert.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all group"
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--toron-light)'; e.currentTarget.style.borderColor = 'var(--toron-primary)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#F3F4F6'; }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--toron-light)', color: 'var(--toron-primary)' }}>
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
                                        <Download size={20} className="text-gray-400 group-hover:text-opacity-80" style={{ color: 'var(--text-muted)' }} />
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-6 text-gray-400 italic text-sm">
                                Aucun certificat joint à ce toron.
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
                )}
            </div>
        </div>
    );
};

export default ViewToron;
