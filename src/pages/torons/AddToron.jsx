import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { Save, Upload } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const AddToron = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { addToron, updateToron } = useInventory();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    const [createdId, setCreatedId] = useState(null);

    const [formData, setFormData] = useState({
        fournisseur: '',
        diametre: '',
        grade: '',
        utilisation: 'Precontrainte',
        identification: '',
        essais: ''
    });
    const [files, setFiles] = useState([]);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const docRef = doc(db, 'torons', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setFormData(docSnap.data());
                } else {
                    alert("Toron introuvable");
                    navigate('/torons/edit');
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

    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted!", formData);
        setLoading(true);
        try {
            if (id) {
                console.log("Updating toron...");
                await updateToron(id, formData, files);
                alert("Toron mis à jour avec succès");
                navigate('/torons/edit');
            } else {
                console.log("Adding new toron...");
                const newId = await addToron(formData, files);
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
                    <h2 className="text-2xl font-bold">Toron Créé !</h2>
                    <p className="text-gray-600">Le toron a été ajouté avec succès.</p>
                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            onClick={() => {
                                setCreatedId(null);
                                setFormData({ fournisseur: '', diametre: '', grade: '', utilisation: 'Precontrainte', identification: '', essais: '' });
                                setFiles([]);
                            }}
                            className="btn btn-outline"
                        >
                            Ajouter un autre
                        </button>
                        <button
                            onClick={() => navigate(`/torons/view/${createdId}`)}
                            className="btn btn-primary"
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
                <div className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-md">
                    <h1 className="text-2xl font-bold">{id ? 'Éditer Toron' : 'Ajouter un Toron'}</h1>
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

                {/* Fournisseur */}
                <div>
                    <label className="input-label">Fournisseur *</label>
                    <input
                        name="fournisseur"
                        required
                        placeholder="Nom du fournisseur"
                        className="form-input"
                        value={formData.fournisseur}
                        onChange={handleChange}
                    />
                </div>

                {/* Diamètre */}
                <div>
                    <label className="input-label">Diamètre *</label>
                    <input
                        name="diametre"
                        required
                        placeholder="ex: 15.2 mm"
                        className="form-input"
                        value={formData.diametre}
                        onChange={handleChange}
                    />
                </div>

                {/* Grade */}
                <div>
                    <label className="input-label">Grade *</label>
                    <input
                        name="grade"
                        required
                        placeholder="ex: 1770 MPa"
                        className="form-input"
                        value={formData.grade}
                        onChange={handleChange}
                    />
                </div>

                {/* Utilisation */}
                <div>
                    <label className="input-label">Utilisation *</label>
                    <select
                        name="utilisation"
                        className="form-input"
                        value={formData.utilisation}
                        onChange={handleChange}
                    >
                        <option value="Precontrainte">Précontrainte</option>
                        <option value="Haubans">Haubans</option>
                    </select>
                </div>

                {/* Identification */}
                <div>
                    <label className="input-label">Identification *</label>
                    <input
                        name="identification"
                        required
                        placeholder="Numéro d'identification"
                        className="form-input"
                        value={formData.identification}
                        onChange={handleChange}
                    />
                </div>

                {/* Essais */}
                <div>
                    <label className="input-label">Utilisé dans quels essais</label>
                    <textarea
                        name="essais"
                        placeholder="Décrire les essais..."
                        className="form-input min-h-[100px]"
                        value={formData.essais}
                        onChange={handleChange}
                    />
                </div>

                {/* Certificat Upload */}
                {!id && (
                    <div>
                        <label className="input-label">Certificat de qualité</label>
                        <div className="relative">
                            <input
                                type="file"
                                multiple
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
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
                                    {files.length} fichier(s) sélectionné(s)
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                >
                    <Save size={20} />
                    {loading ? 'Enregistrement...' : (id ? 'Enregistrer les modifications' : 'Enregistrer et générer QR Code')}
                </button>
            </form>
        </div>
    );
};

export default AddToron;
