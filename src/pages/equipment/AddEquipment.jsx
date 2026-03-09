import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { Save, ArrowLeft, Upload, AlertCircle } from 'lucide-react';
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
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        nom: '',
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
        setErrors({});
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
            setErrors({ submit: error.message });
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
                                setFormData({ nom: '', type: '', dateCalibration: '', dateExpiration: '', etalonnage: '' });
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
            <h1 className="page-header page-header-equipment">
                Ajouter un Équipement
            </h1>

            {/* Error Alert with ARIA live region */}
            <div role="alert" aria-live="polite" aria-atomic="true">
                {errors.submit && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 flex items-center gap-3 border border-red-100">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">{errors.submit}</span>
                    </div>
                )}
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
                    <select
                        name="type"
                        required
                        className="form-input"
                        value={formData.type}
                        onChange={handleChange}
                    >
                        <option value="" disabled>Sélectionner un type</option>
                        <option value="Acquisition">Acquisition</option>
                        <option value="Divers">Divers</option>
                        <option value="Déplacement">Déplacement</option>
                        <option value="Force">Force</option>
                        <option value="Machine">Machine</option>
                        <option value="Pression">Pression</option>
                        <option value="Température">Température</option>
                    </select>
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
                        placeholder="AAAA-MM-JJ"
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
                        placeholder="AAAA-MM-JJ"
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
                    <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) => setFiles([...e.target.files])}
                        className="sr-only"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        className="btn btn-equipment cursor-pointer"
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
