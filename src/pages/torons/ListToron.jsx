import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { FileSpreadsheet, Upload, Edit, Search } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../../utils/excel';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';

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
        <div className="pb-8">
            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 mb-6">
                <button onClick={handleExport} className="btn btn-primary btn-sm">
                    <FileSpreadsheet size={18} />
                    Exporter
                </button>
                <button onClick={handleImportClick} className="btn btn-outline btn-sm">
                    <Upload size={18} />
                    Importer
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept=".xlsx, .xls"
                />
            </div>

            {/* Header */}
            <div className="mb-6 text-center">
                <div className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-md">
                    <h1 className="text-2xl font-bold">Liste des Torons</h1>
                </div>
            </div>

            {/* Search Bar */}
            {!loading && torons.length > 0 && (
                <div className="mb-4 space-y-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher par fournisseur ou identification..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={loading}
                            className="form-input pl-10 pr-10 w-full"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Clear search"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </button>
                        )}
                    </div>
                    {searchTerm && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                                {filteredTorons.length} résultat{filteredTorons.length !== 1 ? 's' : ''} trouvé{filteredTorons.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="space-y-4">
                {loading && <LoadingSkeleton type="card" count={3} />}

                {!loading && torons.length === 0 && (
                    <EmptyState type="toron" />
                )}

                {!loading && torons.length > 0 && filteredTorons.length === 0 && (
                    <EmptyState 
                        type="search" 
                        message="Aucun toron ne correspond à votre recherche"
                        showAction={false}
                    />
                )}

                {filteredTorons.map((toron, index) => (
                    <div key={toron.id} className="card card-hover stagger-item">
                        <div className="flex items-start justify-between gap-4">
                            <div 
                                className="flex-1 cursor-pointer" 
                                onClick={() => navigate(`/torons/view/${toron.id}`)}
                            >
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

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/torons/edit/${toron.id}`);
                                }}
                                className="icon-btn flex-shrink-0"
                                title="Modifier"
                            >
                                <Edit size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListToron;
