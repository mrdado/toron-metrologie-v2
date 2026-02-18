import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { Save, ArrowLeft, Upload } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const AddEquipment = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { addEquipment, updateEquipment } = useInventory();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    const [createdId, setCreatedId] = useState(null);
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
                await updateEquipment(id, formData, files);
                alert("Équipement mis à jour avec succès");
                navigate('/equipements/edit');
            } else {
                console.log("Adding new equipment...");
                const newId = await addEquipment(formData, files);
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
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-400">Chargement...</p>
            </div>
        );
    }

    if (createdId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
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
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-6 text-center">
                <div className="inline-block bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-2xl shadow-md">
                    <h1 className="text-2xl font-bold">{id ? 'Éditer Équipement' : 'Ajouter un Équipement'}</h1>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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

                {/* Certificat Upload */}
                <div>
                    <label className="input-label">Certificats de qualité / Étalonnage</label>
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
                            Télécharger des fichiers
                        </label>
                        {files.length > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                                {files.length} arquivo(s) selecionado(s)
                            </p>
                        )}
                    </div>
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
