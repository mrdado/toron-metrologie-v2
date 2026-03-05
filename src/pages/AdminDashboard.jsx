import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { UserX, ArrowLeft, Bell, Settings } from 'lucide-react';

const AdminDashboard = () => {
    const { currentUser, isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('pending');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (!isAdmin) return;

        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(fetchedUsers);
            setLoading(false);
        });

        return unsubscribe;
    }, [isAdmin]);

    const handleApprove = async (userId) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                isApproved: true,
                approvedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error approving user:", error);
            alert("Erreur lors de l'approbation.");
        }
    };

    const handleToggleAlerts = async (userId, currentState) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                expirationAlertsEnabled: !currentState
            });
        } catch (error) {
            console.error("Error updating alert preference:", error);
        }
    };

    const handleDeny = async (userId) => {
        if (window.confirm("Êtes-vous sûr de vouloir refuser cet accès ?")) {
            try {
                await deleteDoc(doc(db, 'users', userId));
            } catch (error) {
                console.error("Error denying user:", error);
            }
        }
    };

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    const pendingUsers = users.filter(u => u.isApproved === false);
    const allUsers = users.filter(u => u.isApproved === true);

    const filteredUsers = useMemo(() => {
        return (activeTab === 'pending' ? pendingUsers : allUsers).filter(user =>
            user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [activeTab, pendingUsers, allUsers, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    // Reset to page 1 when tab or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    return (
        <div className="min-h-screen w-full p-4 md:p-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Header Bar - Back Button + Search + Filter */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-6">
                    <Link 
                        to="/" 
                        className="admin-back-btn"
                        aria-label="Retour à l'accueil"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        className="flex-1 admin-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Rechercher les utilisateurs"
                    />
                    <button 
                        className="admin-filter-btn"
                        aria-label="Filtrer les utilisateurs"
                        title="Options de filtrage"
                    >
                        <Settings size={18} />
                    </button>
                </div>

                {/* KPI Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                    <div className="admin-stat-card">
                        <div className="admin-stat-number">{pendingUsers.length}</div>
                        <div className="admin-stat-label">En Attente</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-number">{allUsers.length}</div>
                        <div className="admin-stat-label">Actifs</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-number">{users.filter(u => u.isAdmin).length}</div>
                        <div className="admin-stat-label">Admins</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-number">{users.length}</div>
                        <div className="admin-stat-label">Total</div>
                    </div>
                </div>

                {/* Tabs - with proper ARIA attributes */}
                <div className="admin-tabs-container" role="tablist">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`admin-tab ${activeTab === 'pending' ? 'admin-tab-active' : ''}`}
                        role="tab"
                        aria-selected={activeTab === 'pending'}
                        aria-controls="pending-panel"
                    >
                        Demandes ({pendingUsers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`admin-tab ${activeTab === 'all' ? 'admin-tab-active' : ''}`}
                        role="tab"
                        aria-selected={activeTab === 'all'}
                        aria-controls="all-panel"
                    >
                        Utilisateurs ({allUsers.length})
                    </button>
                </div>

                {/* Table Section */}
                <div className="admin-table-wrapper">
                    {loading ? (
                        <div className="admin-loading-state">
                            <div className="admin-spinner"></div>
                            <p>Chargement des utilisateurs...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="admin-empty-state">
                            <p className="text-lg font-semibold mb-2">
                                {activeTab === 'pending' ? '✅ Aucune demande en attente' : '❌ Aucun utilisateur trouvé'}
                            </p>
                            <p className="text-sm text-gray-600">
                                {activeTab === 'pending' 
                                    ? 'Tous les accès ont été approuvés.' 
                                    : 'Essayez de modifier votre recherche.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="admin-table-header">
                                <div className="admin-table-col-1">Nom</div>
                                <div className="admin-table-col-2">Email</div>
                                <div className="admin-table-col-3">Statut</div>
                                <div className="admin-table-col-4">Actions</div>
                            </div>
                            <div className="admin-table-body">
                                {paginatedUsers.map(user => (
                                    <div key={user.id} className="admin-table-row">
                                        <div className="admin-table-col-1">
                                            <span className="font-semibold text-gray-900">{user.fullName || 'Sans nom'}</span>
                                            {user.isAdmin && (
                                                <span className="admin-badge-admin">Admin</span>
                                            )}
                                        </div>
                                        <div className="admin-table-col-2">
                                            <span className="text-sm text-gray-600">{user.email}</span>
                                        </div>
                                        <div className="admin-table-col-3">
                                            <span className={`admin-status-badge ${user.isApproved ? 'admin-status-approved' : 'admin-status-pending'}`}>
                                                {user.isApproved ? 'Approuvé' : 'En attente'}
                                            </span>
                                        </div>
                                        <div className="admin-table-col-4">
                                            <div className="admin-actions-group">
                                                {user.isApproved ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggleAlerts(user.id, user.expirationAlertsEnabled)}
                                                            className="admin-action-btn admin-action-alert"
                                                            aria-label={`Alertes pour ${user.fullName}: ${user.expirationAlertsEnabled ? 'Désactiver' : 'Activer'}`}
                                                            title={user.expirationAlertsEnabled ? 'Désactiver les alertes' : 'Activer les alertes'}
                                                        >
                                                            <Bell size={16} />
                                                            <span className="admin-action-label">
                                                                {user.expirationAlertsEnabled ? 'ON' : 'OFF'}
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeny(user.id)}
                                                            className="admin-action-btn admin-action-delete"
                                                            aria-label={`Supprimer l'accès de ${user.fullName}`}
                                                            title="Supprimer"
                                                        >
                                                            <UserX size={16} />
                                                            <span className="admin-action-label">Supprimer</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(user.id)}
                                                            className="admin-action-btn admin-action-approve"
                                                            aria-label={`Approuver l'accès de ${user.fullName}`}
                                                            title="Approuver"
                                                        >
                                                            <span className="admin-action-label">Approuver</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeny(user.id)}
                                                            className="admin-action-btn admin-action-deny"
                                                            aria-label={`Refuser l'accès de ${user.fullName}`}
                                                            title="Refuser"
                                                        >
                                                            <span className="admin-action-label">Refuser</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="admin-pagination">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="admin-pagination-btn"
                                        aria-label="Page précédente"
                                    >
                                        ← Précédent
                                    </button>
                                    <span className="admin-pagination-info">
                                        Page {currentPage} sur {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="admin-pagination-btn"
                                        aria-label="Page suivante"
                                    >
                                        Suivant →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
