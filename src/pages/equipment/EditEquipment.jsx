import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { Save, Trash2, QrCode, ArrowLeft, Upload, Eye } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const EditEquipment = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { updateEquipment, deleteItem } = useInventory();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [files, setFiles] = useState([]);

    const [formData, setFormData] = useState({
        nom: '',
        numeroSerie: '',
        type: '',
        dateCalibration: '',
        dateExpiration: '',
        etalonnage: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(db, 'equipements', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setFormData(docSnap.data());
                } else {
                    alert("Équipement introuvable");
                    navigate('/equipements/edit');
                }
            } catch (error) {
                console.error("Erreur fetch:", error);
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateEquipment(id, formData, files);
            alert("Équipement mis à jour avec succès");
            navigate('/equipements/edit');
        } catch (error) {
            alert("Erreur : " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?")) return;

        setLoading(true);
        try {
            await deleteItem('equipements', id);
            alert("Équipement supprimé avec succès");
            navigate('/equipements/edit');
        } catch (error) {
            alert("Erreur lors de la suppression : " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-400">Chargement...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Bar */}
            <div className="flex items-center justify-between gap-2 mb-6">
                <Link to="/equipements/edit" className="btn btn-outline btn-sm">
                    <ArrowLeft size={18} />
                    Retour à la liste
                </Link>
                <button
                    onClick={() => navigate(`/equipements/view/${id}`)}
                    className="btn btn-outline btn-sm"
                >
                    <QrCode size={18} />
                    Voir QR Code
                </button>
            </div>

            {/* Header */}
            <h1 className="page-header page-header-equipment">
                Éditer Équipement
            </h1>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-2xl mx-auto">
                {/* UUID Display */}
                <div>
                    <label className="input-label">UUID</label>
                    <input
                        type="text"
                        value={id}
                        disabled
                        className="form-input"
                    />
                </div>

                {/* Nom */}
                <div>
                    <label className="input-label">Nom *</label>
                    <input
                        name="nom"
                        required
                        placeholder="Nom de l'équipement"
                        className="form-input"
                        value={formData.nom}
                        onChange={handleChange}
                    />
                </div>

                {/* Type */}
                <div>
                    <label className="input-label">Type d'équipement *</label>
                    <input
                        name="type"
                        required
                        placeholder="Type d'équipement"
                        className="form-input"
                        value={formData.type}
                        onChange={handleChange}
                    />
                </div>

                {/* Date d'étalonnage */}
                <div>
                    <label className="input-label">Date d'étalonnage</label>
                    <input
                        name="dateCalibration"
                        type="date"
                        className="form-input"
                        value={formData.dateCalibration}
                        onChange={handleChange}
                    />
                </div>

                {/* Date d'expiration */}
                <div>
                    <label className="input-label">Date d'expiration</label>
                    <input
                        name="dateExpiration"
                        type="date"
                        className="form-input"
                        value={formData.dateExpiration}
                        onChange={handleChange}
                    />
                </div>

                {/* Étalonnage */}
                <div>
                    <label className="input-label">Étalonnage</label>
                    <textarea
                        name="etalonnage"
                        placeholder="ex: ax2 + bx + c"
                        className="form-input min-h-[100px]"
                        value={formData.etalonnage}
                        onChange={handleChange}
                    />
                </div>

                {/* Certificat Management */}
                <div>
                    <label className="input-label">Certificats de qualité / Étalonnage</label>

                    {/* Existing Files */}
                    {formData.certificates && formData.certificates.length > 0 && (
                        <div className="space-y-2 mb-4">
                            {formData.certificates.map((cert, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded-lg" style={{ backgroundColor: 'var(--equipment-light)', borderColor: 'var(--equipment-primary)' }}>
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(155, 94, 94, 0.1)', color: 'var(--equipment-primary)' }}>
                                             <Upload size={14} />
                                         </div>
                                        <span className="text-xs font-medium truncate">{cert.name}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <a href={cert.url} target="_blank" rel="noopener noreferrer" className="p-1 text-teal-600 hover:text-teal-800">
                                            <Eye size={16} />
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newCerts = formData.certificates.filter((_, i) => i !== index);
                                                setFormData({ ...formData, certificates: newCerts });
                                            }}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="relative">
                        <input
                            type="file"
                            multiple
                            accept="image/*,.pdf"
                            onChange={(e) => setFiles([...e.target.files])}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="btn btn-outline cursor-pointer"
                        >
                            <Upload size={20} />
                            {formData.certificates?.length > 0 ? 'Ajouter d\'autres fichiers' : 'Télécharger des fichiers'}
                        </label>
                        {files.length > 0 && (
                             <p className="text-sm mt-2 font-medium" style={{ color: 'var(--equipment-primary)' }}>
                                 + {files.length} novo(s) arquivo(s) selecionado(s)
                             </p>
                         )}
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-equipment"
                >
                    <Save size={20} />
                    {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>

                {/* Delete Button */}
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="btn btn-danger"
                >
                    <Trash2 size={20} />
                    Supprimer cet équipement
                </button>
            </form>
        </div>
    );
};

export default EditEquipment;
