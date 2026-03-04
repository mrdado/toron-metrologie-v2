import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { FileSpreadsheet, Upload, Edit, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../../utils/excel';
import { toDisplayDate, parseAnyDate } from '../../utils/dateUtils';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';

const ListEquipment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const filterType = queryParams.get('filter');

    const { equipements, loading, deleteItem, addEquipment, updateEquipment } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = React.useRef(null);

    const filteredEquipments = useMemo(() => {
        let results = equipements;

        // Apply filter from query params
        if (filterType === 'expired') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            results = results.filter(e => {
                if (!e.dateExpiration) return false;
                const expDate = new Date(e.dateExpiration);
                expDate.setHours(0, 0, 0, 0);
                return expDate < today;
            });
        }

        // Apply search term
        return results.filter(e =>
            e.nom?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [equipements, searchTerm, filterType]);

    const getStatus = (dateExpiration) => {
        if (!dateExpiration) return { label: 'N/A', className: 'badge-gray', icon: AlertCircle };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expDate = new Date(dateExpiration);
        expDate.setHours(0, 0, 0, 0);

        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { label: 'Expiré', className: 'badge-red', icon: AlertCircle };
        } else if (diffDays <= 30) {
            return { label: 'Bientôt', className: 'badge-orange', icon: AlertCircle };
        } else {
            return { label: 'Valide', className: 'badge-green', icon: CheckCircle };
        }
    };

    const handleExport = () => {
        const dataToExport = filteredEquipments.map(e => ({
            UUID: e.id,
            Nom: e.nom,
            Type: e.type,
            DateCalibration: toDisplayDate(e.dateCalibration),
            DateExpiration: toDisplayDate(e.dateExpiration),
            Etalonnage: e.etalonnage
        }));
        exportToExcel(dataToExport, `Inventaire_Equipements_${new Date().toISOString().split('T')[0]}`);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const data = await importFromExcel(file);

            // Build a Set of UUIDs from the Excel file (only rows that have a UUID)
            const excelUUIDs = new Set(data.filter(row => row.UUID).map(row => String(row.UUID)));

            // Find items in DB that are NOT in the Excel file => to be deleted
            const toDelete = equipements.filter(eq => !excelUUIDs.has(eq.id));

            // Show a detailed confirmation dialog
            if (toDelete.length > 0) {
                const confirmed = window.confirm(
                    `Attention: Cette synchronisation va:\n` +
                    `- Mettre à jour / Ajouter les équipements du fichier Excel\n` +
                    `- Supprimer ${toDelete.length} équipement(s) absent(s) du fichier Excel:\n` +
                    toDelete.map(eq => `  • ${eq.nom || eq.id}`).join('\n') +
                    `\n\nContinuer ?`
                );
                if (!confirmed) {
                    e.target.value = null;
                    return;
                }
            } else {
                if (!window.confirm("Attention: L'importation va modifier la base de données. Continuer ?")) {
                    e.target.value = null;
                    return;
                }
            }

            let created = 0;
            let updated = 0;
            let deleted = 0;

            // Step 1: Update existing items or add new ones
            for (const row of data) {
                const itemData = {
                    nom: row.Nom || '',
                    type: row.Type || '',
                    dateCalibration: parseAnyDate(row.DateCalibration),
                    dateExpiration: parseAnyDate(row.DateExpiration),
                    etalonnage: row.Etalonnage || ''
                };

                if (row.UUID && equipements.some(eq => eq.id === String(row.UUID))) {
                    await updateEquipment(String(row.UUID), itemData);
                    updated++;
                } else {
                    await addEquipment(itemData);
                    created++;
                }
            }

            // Step 2: Delete items that are in the DB but not in the Excel file
            for (const item of toDelete) {
                await deleteItem('equipment', item.id);
                deleted++;
            }

            alert(
                `Synchronisation réussie !\n` +
                `✔ Créés: ${created}\n` +
                `✔ Mis à jour: ${updated}\n` +
                `🗑 Supprimés: ${deleted}`
            );
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la synchronisation : " + err.message);
        } finally {
            e.target.value = null;
        }
    };

    return (
        <div className="pb-8">
            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 mb-6">
                <button onClick={handleExport} className="btn btn-equipment btn-sm">
                    <FileSpreadsheet size={18} />
                    Exporter
                </button>
                <button onClick={handleImportClick} className="btn btn-outline btn-sm">
                    <Upload size={18} />
                    Synchroniser Excel
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
            <h1 className="page-header page-header-equipment">
                Liste des Équipements
            </h1>

            {/* Search Bar */}
            {!loading && equipements.length > 0 && (
                <div className="mb-4 space-y-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom..."
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
                                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        )}
                    </div>
                    {searchTerm && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                                {filteredEquipments.length} résultat{filteredEquipments.length !== 1 ? 's' : ''} trouvé{filteredEquipments.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="space-y-4">
                {loading && <LoadingSkeleton type="card" count={3} />}

                {!loading && equipements.length === 0 && (
                    <EmptyState type="equipment" />
                )}

                {!loading && equipements.length > 0 && filteredEquipments.length === 0 && (
                    <EmptyState
                        type="search"
                        message="Aucun équipement ne correspond à votre recherche"
                        showAction={false}
                    />
                )}

                {filteredEquipments.map((equip) => {
                    const status = getStatus(equip.dateExpiration);
                    return (
                        <div key={equip.id} className="card card-hover stagger-item">
                            <div className="flex items-start justify-between gap-4">
                                <div
                                    className="flex-1 cursor-pointer"
                                    onClick={() => navigate(`/equipements/view/${equip.id}`)}
                                >
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {equip.nom}
                                    </h3>

                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className="badge badge-green">
                                            {equip.type}
                                        </span>
                                        <span className={`badge ${status.className}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-500">
                                        Expiration: {toDisplayDate(equip.dateExpiration)}
                                    </p>
                                    {equip.certificates && equip.certificates.length > 0 && (
                                        <div className="mt-2 text-teal-600 font-medium text-xs flex items-center gap-1">
                                            <Upload size={12} />
                                            {equip.certificates.length} {equip.certificates.length > 1 ? 'fichiers' : 'fichier'}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={(ev) => {
                                        ev.stopPropagation();
                                        navigate(`/equipements/edit/${equip.id}`);
                                    }}
                                    className="icon-btn flex-shrink-0"
                                    title="Modifier"
                                >
                                    <Edit size={20} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ListEquipment;
