import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { Save, Trash2, QrCode, ArrowLeft } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const EditToron = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { updateToron, deleteItem } = useInventory();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        fournisseur: '',
        diametre: '',
        grade: '',
        utilisation: 'Precontrainte',
        identification: '',
        essais: ''
    });

    useEffect(() => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateToron(id, formData);
            alert("Toron mis à jour avec succès");
            navigate('/torons/edit');
        } catch (error) {
            alert("Erreur : " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce toron ?")) return;

        setLoading(true);
        try {
            await deleteItem('torons', id);
            alert("Toron supprimé avec succès");
            navigate('/torons/edit');
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
                <Link to="/torons/edit" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                    <ArrowLeft size={20} />
                    Retour à la liste
                </Link>
                <button
                    onClick={() => navigate(`/torons/view/${id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <QrCode size={20} />
                    Voir QR Code
                </button>
            </div>

            {/* Header */}
            <div className="page-header">
                Éditer Toron
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

                {/* Certificat Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Certificat de qualité:</strong> Télécharger des fichiers
                    </p>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
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
                    Supprimer ce toron
                </button>
            </form>
        </div>
    );
};

export default EditToron;
