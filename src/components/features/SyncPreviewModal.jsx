import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Trash2, PlusCircle, RefreshCw, X, ChevronDown, ChevronRight } from 'lucide-react';
import { toDisplayDate } from '../../utils/dateUtils';

const SyncPreviewModal = ({ isOpen, onClose, diffData, onConfirm, isProcessing }) => {
    if (!isOpen || !diffData) return null;

    const { toAdd = [], toUpdate = [], toDelete = [], unchangedCount = 0 } = diffData;
    const [deleteObsolete, setDeleteObsolete] = useState(true);

    const totalChanges = toAdd.length + toUpdate.length + (deleteObsolete ? toDelete.length : 0);

    const handleConfirm = () => {
        onConfirm({
            toAdd,
            toUpdate,
            toDelete: deleteObsolete ? toDelete : []
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">

                {/* Modal Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                            <RefreshCw size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Synchronisation des Équipements</h2>
                            <p className="text-xs text-gray-500">Vérification avant mise à jour de la base de données</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={isProcessing}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">

                    {/* Summary Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                            <span className="text-xs font-semibold text-emerald-600 uppercase">Nouveaux</span>
                            <p className="text-2xl font-bold text-emerald-700 mt-1">+{toAdd.length}</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                            <span className="text-xs font-semibold text-amber-600 uppercase">Modifiés</span>
                            <p className="text-2xl font-bold text-amber-700 mt-1">↻ {toUpdate.length}</p>
                        </div>
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-center">
                            <span className="text-xs font-semibold text-rose-600 uppercase">Absents</span>
                            <p className="text-2xl font-bold text-rose-700 mt-1">-{toDelete.length}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                            <span className="text-xs font-semibold text-slate-500 uppercase">Identiques</span>
                            <p className="text-2xl font-bold text-slate-700 mt-1">✓ {unchangedCount}</p>
                        </div>
                    </div>

                    {/* Checkbox for Obsolete Deletion */}
                    {toDelete.length > 0 && (
                        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="deleteObsolete"
                                checked={deleteObsolete}
                                onChange={(e) => setDeleteObsolete(e.target.checked)}
                                className="mt-1 h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                            />
                            <label htmlFor="deleteObsolete" className="text-xs text-rose-900 leading-relaxed cursor-pointer font-medium">
                                Supprimer automatiquement les <strong className="font-bold">{toDelete.length} équipement(s) absents</strong> du fichier entreprise (recommandé pour garder l'inventaire exact).
                            </label>
                        </div>
                    )}

                    {/* Section: New Items */}
                    {toAdd.length > 0 && (
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-emerald-50/50 px-4 py-3 border-b border-emerald-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-800 flex items-center gap-2">
                                    <PlusCircle size={16} />
                                    Nouveaux équipements à créer ({toAdd.length})
                                </span>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto bg-white">
                                {toAdd.map((item, idx) => (
                                    <div key={idx} className="p-3 text-xs flex items-center justify-between">
                                        <div>
                                            <span className="font-bold text-gray-900">{item.nom}</span>
                                            <span className="ml-2 text-gray-500">({item.type})</span>
                                        </div>
                                        <div className="text-gray-500 text-right">
                                            {item.dateExpiration ? `Exp: ${toDisplayDate(item.dateExpiration)}` : 'Pas de date'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section: Updated Items */}
                    {toUpdate.length > 0 && (
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-amber-50/50 px-4 py-3 border-b border-amber-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-800 flex items-center gap-2">
                                    <RefreshCw size={16} />
                                    Équipements avec modifications ({toUpdate.length})
                                </span>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto bg-white">
                                {toUpdate.map((item, idx) => (
                                    <div key={idx} className="p-3 text-xs space-y-1">
                                        <div className="font-bold text-gray-900 flex justify-between">
                                            <span>{item.nom}</span>
                                            <span className="text-amber-600 font-medium">Mise à jour</span>
                                        </div>
                                        <div className="text-gray-500 flex gap-4 text-[11px]">
                                            {item.changes.dateExpiration && (
                                                <span>Exp: <s className="text-red-400">{toDisplayDate(item.changes.dateExpiration.old) || 'N/A'}</s> ➔ <b className="text-emerald-600">{toDisplayDate(item.changes.dateExpiration.new)}</b></span>
                                            )}
                                            {item.changes.etalonnage && (
                                                <span>Formule modifiée</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section: Deleted Items */}
                    {toDelete.length > 0 && deleteObsolete && (
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-rose-50/50 px-4 py-3 border-b border-rose-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-rose-800 flex items-center gap-2">
                                    <Trash2 size={16} />
                                    Équipements qui seront supprimés ({toDelete.length})
                                </span>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-36 overflow-y-auto bg-white">
                                {toDelete.map((item, idx) => (
                                    <div key={idx} className="p-3 text-xs flex items-center justify-between text-gray-600">
                                        <span className="font-medium text-rose-900">{item.nom}</span>
                                        <span className="text-gray-400">ID: {item.id.substring(0, 8)}...</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {totalChanges === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                            <CheckCircle size={36} className="text-emerald-500 mx-auto mb-2" />
                            <p className="text-sm font-bold text-gray-800">Tout est déjà à jour !</p>
                            <p className="text-xs text-gray-500 mt-1">Le fichier entreprise correspond exactement à la base de données actuelle.</p>
                        </div>
                    )}

                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="btn btn-outline btn-sm"
                        disabled={isProcessing}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="btn btn-equipment btn-sm flex items-center gap-2"
                        disabled={isProcessing || (totalChanges === 0 && !deleteObsolete)}
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Synchronisation...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={18} />
                                Confirmer la synchronisation ({totalChanges})
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SyncPreviewModal;
