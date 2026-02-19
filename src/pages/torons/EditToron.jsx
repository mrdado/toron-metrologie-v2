import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { Save, Trash2, QrCode, ArrowLeft, Upload } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const EditToron = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { updateToron, deleteItem } = useInventory();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [files, setFiles] = useState([]);
    const fileInputRef = React.useRef(null);

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
            await updateToron(id, formData, files);
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
            await deleteItem('toron', id);
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
            <div className="flex items-center justify-between gap-2 mb-6">
                <Link to="/torons/edit" className="btn btn-outline btn-sm">
                    <ArrowLeft size={18} />
                    Retour à la liste
                </Link>
                <button
                    onClick={() => navigate(`/torons/view/${id}`)}
                    className="btn btn-outline btn-sm"
                >
                    <QrCode size={18} />
                    Voir QR Code
                </button>
            </div>

            {/* Header */}
            <h1 className="page-header page-header-toron">
                Éditer Toron
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
                <div>
                    <label className="input-label">Certificats de qualité</label>

                    {/* Existing Files */}
                    {formData.certificates && formData.certificates.length > 0 && (
                        <div className="space-y-2 mb-4">
                            {formData.certificates.map((cert, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded-lg" style={{ backgroundColor: 'var(--toron-light)', borderColor: 'var(--toron-primary)' }}>
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(75, 107, 166, 0.1)', color: 'var(--toron-primary)' }}>
                                             <Upload size={14} />
                                         </div>
                                        <span className="text-xs font-medium truncate">{cert.name}</span>
                                    </div>
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
                            ))}
                        </div>
                    )}

                    <div>
                        <input
                            type="file"
                            multiple
                            accept="image/*,.pdf"
                            onChange={(e) => setFiles([...e.target.files])}
                            ref={fileInputRef}
                            style={{display: 'none'}}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-outline"
                        >
                            <Upload size={20} />
                            {formData.certificates?.length > 0 ? 'Ajouter d\'autres fichiers' : 'Télécharger des fichiers'}
                        </button>
                        {files.length > 0 && (
                            <p className="text-sm text-blue-600 mt-2 font-medium">
                                + {files.length} novo(s) arquivo(s) selecionado(s)
                            </p>
                        )}
                    </div>
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
