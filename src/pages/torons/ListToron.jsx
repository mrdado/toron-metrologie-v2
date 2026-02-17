import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { ArrowLeft, FileSpreadsheet, Upload, QrCode, Edit, Eye } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../../utils/excel';

const ListToron = () => {
    const navigate = useNavigate();
    const { torons, loading, deleteItem, addToron, updateToron } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = React.useRef(null);

    const filteredTorons = useMemo(() => {
        return torons.filter(t =>
            t.fournisseur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.identification?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [torons, searchTerm]);

    const handleExport = () => {
        const dataToExport = filteredTorons.map(t => ({
            UUID: t.id,
            Fournisseur: t.fournisseur,
            Diametre: t.diametre,
            Grade: t.grade,
            Utilisation: t.utilisation,
            Identification: t.identification,
            Essais: t.essais
        }));
        exportToExcel(dataToExport, `Inventaire_Torons_${new Date().toISOString().split('T')[0]}`);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!window.confirm("Attention: L'importation modifiera la base de données. Continuer ?")) {
            e.target.value = null;
            return;
        }

        try {
            const data = await importFromExcel(file);
            let created = 0;
            let updated = 0;

            for (const row of data) {
                const itemData = {
                    fournisseur: row.Fournisseur || '',
                    diametre: row.Diametre || '',
                    grade: row.Grade || '',
                    utilisation: row.Utilisation || 'Precontrainte',
                    identification: row.Identification || '',
                    essais: row.Essais || ''
                };

                if (row.UUID && torons.some(t => t.id === row.UUID)) {
                    await updateToron(row.UUID, itemData);
                    updated++;
                } else {
                    await addToron(itemData);
                    created++;
                }
            }
            alert(`Importation réussie !\nCréés: ${created}\nMis à jour: ${updated}`);
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'importation : " + err.message);
        } finally {
            e.target.value = null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            {/* Top Bar */}
            <div className="bg-white p-4 flex items-center justify-between gap-4 shadow-sm">
                <button onClick={() => navigate('/')} className="icon-btn">
                    <ArrowLeft size={24} />
                </button>

                <div className="flex gap-2">
                    <button onClick={handleExport} className="btn btn-outline btn-sm flex-1">
                        <FileSpreadsheet size={18} />
                        Exportar
                    </button>
                    <button onClick={handleImportClick} className="btn btn-dark btn-sm flex-1">
                        <Upload size={18} />
                        Importar
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".xlsx, .xls"
                    />
                </div>
            </div>

            {/* Header */}
            <div className="page-header">
                Liste des Torons
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {loading && (
                    <div className="text-center py-12 text-gray-400">
                        Chargement...
                    </div>
                )}

                {!loading && filteredTorons.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        Aucun toron trouvé.
                    </div>
                )}

                {filteredTorons.map((toron) => (
                    <div key={toron.id} className="card card-hover">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {toron.fournisseur}
                                </h3>

                                <div className="flex flex-wrap gap-2 mb-2">
                                    <span className="badge badge-gray">
                                        {toron.diametre}
                                    </span>
                                    <span className="badge badge-blue">
                                        {toron.grade}
                                    </span>
                                    <span className="badge badge-purple">
                                        {toron.utilisation}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <p className="text-sm text-gray-500">
                                        ID: {toron.identification}
                                    </p>
                                    {toron.certificates && toron.certificates.length > 0 && (
                                        <span className="flex items-center gap-1 text-blue-600 font-medium text-xs bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                            <Upload size={12} />
                                            {toron.certificates.length} {toron.certificates.length > 1 ? 'arquivos' : 'arquivo'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/torons/view/${toron.id}`)}
                                    className="icon-btn text-blue-600 hover:bg-blue-50"
                                    title="Voir Détails"
                                >
                                    <Eye size={20} />
                                </button>
                                <button
                                    onClick={() => navigate(`/torons/edit/${toron.id}`)}
                                    className="icon-btn"
                                    title="Modifier"
                                >
                                    <Edit size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListToron;
