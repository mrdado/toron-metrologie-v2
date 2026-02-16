import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { Save, ArrowLeft } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const AddEquipment = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { addEquipment, updateEquipment } = useInventory();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    const [createdId, setCreatedId] = useState(null);

    const [formData, setFormData] = useState({
        nom: '',
        numeroSerie: '',
        type: '',
        dateCalibration: '',
        dateExpiration: '',
        etalonnage: ''
    });

    useEffect(() => {
        if (!id) return;

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
        console.log("Equipment form submitted!", formData);
        setLoading(true);
        try {
            if (id) {
                console.log("Updating equipment...");
                await updateEquipment(id, formData);
                alert("Équipement mis à jour avec succès");
                navigate('/equipements/edit');
            } else {
                console.log("Adding new equipment...");
                const newId = await addEquipment(formData);
                console.log("Created with ID:", newId);
                setCreatedId(newId);
            }
        } catch (error) {
            console.error("Error in handleSubmit:", error);
            alert("Erreur : " + error.message);
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

    if (createdId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="card max-w-md w-full text-center space-y-4">
                    <div className="text-green-600 text-5xl mb-4">✓</div>
                    <h2 className="text-2xl font-bold">Équipement Créé !</h2>
                    <p className="text-gray-600">L'équipement a été ajouté avec succès.</p>
                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            onClick={() => {
                                setCreatedId(null);
                                setFormData({ nom: '', numeroSerie: '', type: '', dateCalibration: '', dateExpiration: '', etalonnage: '' });
                            }}
                            className="btn btn-outline"
                        >
                            Ajouter un autre
                        </button>
                        <button
                            onClick={() => navigate(`/equipements/view/${createdId}`)}
                            className="btn btn-equipment"
                        >
                            Voir les détails
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Link */}
            {!id && (
                <div className="p-4">
                    <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft size={20} />
                        Retour à l'accueil
                    </Link>
                </div>
            )}

            {/* Header */}
            <div className="page-header page-header-equipment">
                {id ? 'Éditer Équipement' : 'Ajouter un Équipement'}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-2xl mx-auto">
                {/* UUID Display (only in edit mode) */}
                {id && (
                    <div>
                        <label className="input-label">UUID (généré automatiquement)</label>
                        <input
                            type="text"
                            value={id}
                            disabled
                            className="form-input"
                        />
                    </div>
                )}

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

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-equipment"
                >
                    <Save size={20} />
                    {loading ? 'Enregistrement...' : (id ? 'Enregistrer les modifications' : 'Enregistrer et générer QR Code')}
                </button>
            </form>
        </div>
    );
};

export default AddEquipment;
