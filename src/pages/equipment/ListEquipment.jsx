import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { FileSpreadsheet, Upload, Edit, AlertCircle, CheckCircle, Search, QrCode, Archive, RefreshCw, Trash2 } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../../utils/excel';
import { toDisplayDate, parseAnyDate } from '../../utils/dateUtils';
import { exportQRCodesPDF, exportQRCodesZIP } from '../../utils/qrExport';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import SyncPreviewModal from '../../components/features/SyncPreviewModal';

const ListEquipment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const filterType = queryParams.get('filter');

    const { equipements, loading, deleteItem, addEquipment, updateEquipment } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = React.useRef(null);

    // Sync Modal State
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [syncDiffData, setSyncDiffData] = useState(null);
    const [isSyncProcessing, setIsSyncProcessing] = useState(false);

    // Count empty/invalid equipments created by legacy sync
    const emptyEquipmentsCount = useMemo(() => {
        return equipements.filter(e =>
            !e.nom ||
            String(e.nom).trim() === '' ||
            String(e.nom).trim() === 'Équipement sans nom' ||
            String(e.nom).trim() === 'Numéro'
        ).length;
    }, [equipements]);

    // Map equipment types to badge class names
    const getEquipmentBadgeClass = (type) => {
        const strType = String(type || '');
        const typeMap = {
            'Acquisition': 'badge-acquisition',
            'Divers': 'badge-divers',
            'Déplacement': 'badge-deplacement',
            'Force': 'badge-force',
            'Machine': 'badge-machine',
            'Pression': 'badge-pression',
            'Température': 'badge-temperature'
        };
        return typeMap[strType] || 'badge-gray';
    };

    const filteredEquipments = useMemo(() => {
        let results = equipements;

        if (filterType === 'expired') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            results = results.filter(e => {
                if (!e.dateExpiration) return false;
                const expDate = new Date(e.dateExpiration);
                expDate.setHours(0, 0, 0, 0);
                return !isNaN(expDate.getTime()) && expDate < today;
            });
        }

        const searchLower = String(searchTerm || '').toLowerCase();
        return results.filter(e =>
            String(e.nom || '').toLowerCase().includes(searchLower)
        );
    }, [equipements, searchTerm, filterType]);

    const getStatus = (dateExpiration) => {
        if (!dateExpiration) return { label: 'N/A', className: 'badge-gray', icon: AlertCircle };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expDate = new Date(dateExpiration);
        expDate.setHours(0, 0, 0, 0);

        if (isNaN(expDate.getTime())) {
            return { label: 'N/A', className: 'badge-gray', icon: AlertCircle };
        }

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
            Nom: String(e.nom || ''),
            Type: String(e.type || ''),
            DateCalibration: toDisplayDate(e.dateCalibration),
            DateExpiration: toDisplayDate(e.dateExpiration),
            Etalonnage: String(e.etalonnage || '')
        }));
        exportToExcel(dataToExport, `Inventaire_Equipements_${new Date().toISOString().split('T')[0]}`);
    };

    const handleExportPDF = async () => {
        await exportQRCodesPDF(filteredEquipments, 'equipment');
    };

    const handleExportZIP = async () => {
        await exportQRCodesZIP(filteredEquipments, 'equipment');
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    /**
     * Cleans up all empty / "Équipement sans nom" items created by legacy sync attempts.
     */
    const handleCleanupEmpty = async () => {
        const emptyItems = equipements.filter(e =>
            !e.nom ||
            String(e.nom).trim() === '' ||
            String(e.nom).trim() === 'Équipement sans nom' ||
            String(e.nom).trim() === 'Numéro'
        );

        if (emptyItems.length === 0) {
            alert("Aucun équipement vide à nettoyer.");
            return;
        }

        const confirmed = window.confirm(
            `Nettoyage de la base de données:\n` +
            `Voulez-vous supprimer les ${emptyItems.length} équipement(s) vides / sans nom ?`
        );

        if (!confirmed) return;

        let deleted = 0;
        for (const item of emptyItems) {
            await deleteItem('equipment', item.id);
            deleted++;
        }

        alert(`Nettoyage réussi ! ${deleted} équipement(s) vide(s) supprimé(s).`);
    };

    /**
     * Handles file upload from Corporate Software (GBE) or standard App exports.
     * Computes diff and opens interactive review modal.
     */
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const parsedItems = await importFromExcel(file);
            if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
                alert("Le fichier Excel semble vide ou illisible.");
                return;
            }

            const toAdd = [];
            const toUpdate = [];
            const matchedAppIds = new Set();
            let unchangedCount = 0;

            for (const item of parsedItems) {
                // Match by UUID if present, or by Nom (case-insensitive)
                const matchedEq = equipements.find(eq =>
                    (item.uuid && String(eq.id).trim().toLowerCase() === item.uuid.toLowerCase()) ||
                    (String(eq.nom || '').trim().toLowerCase() === String(item.nom || '').trim().toLowerCase())
                );

                if (matchedEq) {
                    matchedAppIds.add(matchedEq.id);

                    const changes = {};
                    if (item.type && item.type !== matchedEq.type) {
                        changes.type = { old: matchedEq.type, new: item.type };
                    }
                    if (item.dateCalibration && item.dateCalibration !== matchedEq.dateCalibration) {
                        changes.dateCalibration = { old: matchedEq.dateCalibration, new: item.dateCalibration };
                    }
                    if (item.dateExpiration && item.dateExpiration !== matchedEq.dateExpiration) {
                        changes.dateExpiration = { old: matchedEq.dateExpiration, new: item.dateExpiration };
                    }
                    if (item.etalonnage !== undefined && item.etalonnage !== matchedEq.etalonnage) {
                        changes.etalonnage = { old: matchedEq.etalonnage, new: item.etalonnage };
                    }

                    if (Object.keys(changes).length > 0) {
                        toUpdate.push({
                            id: matchedEq.id,
                            nom: item.nom || matchedEq.nom,
                            data: {
                                nom: item.nom || matchedEq.nom,
                                type: item.type || matchedEq.type,
                                dateCalibration: item.dateCalibration || matchedEq.dateCalibration || '',
                                dateExpiration: item.dateExpiration || matchedEq.dateExpiration || '',
                                etalonnage: item.etalonnage !== undefined ? item.etalonnage : (matchedEq.etalonnage || '')
                            },
                            changes
                        });
                    } else {
                        unchangedCount++;
                    }
                } else {
                    toAdd.push({
                        nom: item.nom,
                        type: item.type || 'Divers',
                        dateCalibration: item.dateCalibration || '',
                        dateExpiration: item.dateExpiration || '',
                        etalonnage: item.etalonnage || ''
                    });
                }
            }

            // Items in app absent from uploaded file (excluding already corrupted empty items)
            const validEquipments = equipements.filter(e =>
                e.nom &&
                String(e.nom).trim() !== '' &&
                String(e.nom).trim() !== 'Équipement sans nom' &&
                String(e.nom).trim() !== 'Numéro'
            );
            const toDelete = validEquipments.filter(eq => !matchedAppIds.has(eq.id));

            setSyncDiffData({ toAdd, toUpdate, toDelete, unchangedCount });
            setIsSyncModalOpen(true);

        } catch (err) {
            console.error("Erreur lors de la lecture du fichier Excel:", err);
            alert("Erreur lors de la lecture du fichier : " + err.message);
        } finally {
            e.target.value = null;
        }
    };

    /**
     * Executes the batch database operations after user confirmation in SyncPreviewModal.
     */
    const handleConfirmSync = async (confirmedDiff) => {
        setIsSyncProcessing(true);
        try {
            let created = 0;
            let updated = 0;
            let deleted = 0;

            // 1. Add new items
            for (const item of confirmedDiff.toAdd) {
                await addEquipment(item);
                created++;
            }

            // 2. Update changed items
            for (const item of confirmedDiff.toUpdate) {
                await updateEquipment(item.id, item.data);
                updated++;
            }

            // 3. Delete obsolete items
            for (const item of confirmedDiff.toDelete) {
                await deleteItem('equipment', item.id);
                deleted++;
            }

            setIsSyncModalOpen(false);
            alert(
                `Synchronisation réussie !\n` +
                `✔ Créés: ${created}\n` +
                `✔ Mis à jour: ${updated}\n` +
                `🗑 Supprimés: ${deleted}`
            );
        } catch (err) {
            console.error("Erreur lors de l'application de la synchronisation:", err);
            alert("Erreur lors de la synchronisation : " + err.message);
        } finally {
            setIsSyncProcessing(false);
        }
    };

    return (
        <div className="pb-8">
            {/* Sync Preview Modal */}
            <SyncPreviewModal
                isOpen={isSyncModalOpen}
                onClose={() => setIsSyncModalOpen(false)}
                diffData={syncDiffData}
                onConfirm={handleConfirmSync}
                isProcessing={isSyncProcessing}
            />

            {/* Cleanup Alert Banner if corrupted/empty records exist */}
            {emptyEquipmentsCount > 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
                        <span>{emptyEquipmentsCount} équipement(s) sans nom / vides détectés dans la base.</span>
                    </div>
                    <button
                        onClick={handleCleanupEmpty}
                        className="btn btn-sm bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs px-3 py-1 rounded-lg flex items-center gap-1.5 flex-shrink-0"
                    >
                        <Trash2 size={14} />
                        Nettoyer ({emptyEquipmentsCount})
                    </button>
                </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-end gap-2 mb-6">
                <button onClick={handleExportPDF} className="btn btn-equipment btn-sm">
                    <QrCode size={18} />
                    PDF QR Codes
                </button>
                <button onClick={handleExportZIP} className="btn btn-outline btn-sm">
                    <Archive size={18} />
                    ZIP QR Codes
                </button>
                <button onClick={handleExport} className="btn btn-outline btn-sm">
                    <FileSpreadsheet size={18} />
                    Excel
                </button>
                <button onClick={handleImportClick} className="btn btn-outline btn-sm flex items-center gap-2">
                    <Upload size={18} />
                    Synchroniser GBE / Excel
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
                    const displayName = String(equip.nom || 'Équipement sans nom');
                    const displayType = String(equip.type || 'Divers');

                    return (
                        <div
                            key={equip.id}
                            className="card card-hover stagger-item cursor-pointer"
                            onClick={() => navigate(`/equipements/view/${equip.id}`)}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {displayName}
                                    </h3>

                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className={`badge ${getEquipmentBadgeClass(displayType)}`}>
                                            {displayType}
                                        </span>
                                        <span className={`badge ${status.className}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-500">
                                        Expiration: {toDisplayDate(equip.dateExpiration) || 'N/A'}
                                    </p>
                                    {Array.isArray(equip.certificates) && equip.certificates.length > 0 && (
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
