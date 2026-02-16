import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { Save, Trash2, QrCode, ArrowLeft } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const EditEquipment = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { updateEquipment, deleteItem } = useInventory();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

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
            await updateEquipment(id, formData);
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
            <div className="bg-white p-4 flex items-center justify-between shadow-sm">
                <Link to="/equipements/edit" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                    <ArrowLeft size={20} />
                    Retour à la liste
                </Link>
                <button
                    onClick={() => navigate(`/equipements/view/${id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <QrCode size={20} />
                    Voir QR Code
                </button>
            </div>

            {/* Header */}
            <div className="page-header page-header-equipment">
                Éditer Équipement
            </div>

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
