import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { ArrowLeft, FileSpreadsheet, Upload, QrCode, Edit, AlertCircle, CheckCircle, Eye, Search } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../../utils/excel';
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
            e.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.numeroSerie?.toLowerCase().includes(searchTerm.toLowerCase())
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
            NumeroSerie: e.numeroSerie,
            Type: e.type,
            DateCalibration: e.dateCalibration,
            DateExpiration: e.dateExpiration,
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
                    nom: row.Nom || '',
                    numeroSerie: row.NumeroSerie || '',
                    type: row.Type || '',
                    dateCalibration: row.DateCalibration || '',
                    dateExpiration: row.DateExpiration || '',
                    etalonnage: row.Etalonnage || ''
                };

                if (row.UUID && equipements.some(e => e.id === row.UUID)) {
                    await updateEquipment(row.UUID, itemData);
                    updated++;
                } else {
                    await addEquipment(itemData);
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
            <div className="flex items-center justify-between gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="icon-btn">
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
            <div className="mb-6 text-center">
                <div className="inline-block bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-2xl shadow-md">
                    <h1 className="text-2xl font-bold">Liste des Équipements</h1>
                </div>
            </div>

            {/* Search Bar */}
            {!loading && equipements.length > 0 && (
                <div className="mb-4 space-y-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou numéro de série..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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

                {filteredEquipments.map((equip, index) => {
                    const status = getStatus(equip.dateExpiration);
                    return (
                        <div key={equip.id} className="card card-hover stagger-item">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
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
                                        Expiration: {equip.dateExpiration}
                                    </p>
                                    {equip.certificates && equip.certificates.length > 0 && (
                                        <div className="mt-2 text-teal-600 font-medium text-xs flex items-center gap-1">
                                            <Upload size={12} />
                                            {equip.certificates.length} {equip.certificates.length > 1 ? 'fichiers' : 'fichier'}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/equipements/view/${equip.id}`)}
                                        className="icon-btn text-teal-600 hover:bg-teal-50"
                                        title="Voir Détails"
                                    >
                                        <Eye size={20} />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/equipements/edit/${equip.id}`)}
                                        className="icon-btn"
                                        title="Modifier"
                                    >
                                        <Edit size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ListEquipment;
