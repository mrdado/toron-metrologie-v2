import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Plus, ChevronRight, AlertCircle } from 'lucide-react';
import { trackPageView, trackNavigation } from '../utils/analytics';
import { useInventory } from '../context/InventoryContext';

const Home = () => {
    const { torons, equipements } = useInventory();
    const [expiredCount, setExpiredCount] = useState(0);

    // Set page title for accessibility and SEO
    useEffect(() => {
        document.title = 'Accueil - IPS TestLAB';
        trackPageView('Home');
    }, []);

    // Calculate expired calibrations
    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const expired = equipements.filter(eq => {
            if (eq.dateExpiration) {
                const expDate = new Date(eq.dateExpiration);
                expDate.setHours(0, 0, 0, 0);
                return expDate < today;
            }
            return false;
        });
        setExpiredCount(expired.length);
    }, [equipements]);

    return (
        <div className="p-4 animate-fade-in">
            <div className="max-w-md mx-auto">
                <h1 className="sr-only">Gestion QR Code - Torons et Équipements</h1>

                {/* Hero Scanner Button */}
                <Link
                    to="/scan"
                    className="hero-scanner-btn"
                    aria-label="Ouvrir le scanner QR Code pour lire un code"
                    onClick={() => trackNavigation('/scan', 'Scanner QR Code')}
                >
                    <div className="hero-scanner-icon">
                        <QrCode size={48} />
                    </div>
                    <div className="hero-scanner-title">Scanner QR Code</div>
                    <div className="hero-scanner-subtitle">Appuyez pour démarrer</div>
                </Link>

                {/* Quick Actions Grid */}
                <div className="quick-actions-grid">
                    <Link
                        to="/torons/add"
                        className="quick-action-card toron-icon"
                        aria-label="Ajouter un nouveau toron au système"
                        onClick={() => trackNavigation('/torons/add', 'Ajouter Toron')}
                    >
                        <div className="quick-action-icon">
                            <Plus size={24} />
                        </div>
                        <div className="quick-action-label">Nouveau Toron</div>
                        <div className="quick-action-count">{torons.length} total</div>
                    </Link>

                    <Link
                        to="/equipements/add"
                        className="quick-action-card equipment-icon"
                        aria-label="Ajouter un nouvel équipement au système"
                        onClick={() => trackNavigation('/equipements/add', 'Ajouter Équipement')}
                    >
                        <div className="quick-action-icon">
                            <Plus size={24} />
                        </div>
                        <div className="quick-action-label">Nouvel Équipement</div>
                        <div className="quick-action-count">{equipements.length} total</div>
                    </Link>
                </div>

                {/* Management Links */}
                <div className="management-links">
                    <Link
                        to="/torons/edit"
                        className="management-link toron-link"
                        aria-label="Voir la liste et gérer les torons existants"
                        onClick={() => trackNavigation('/torons/edit', 'Gérer Torons')}
                    >
                        <span>Gérer Torons</span>
                        <ChevronRight size={20} className="management-arrow" />
                    </Link>

                    <Link
                        to="/equipements/edit"
                        className="management-link equipment-link"
                        aria-label="Voir la liste et gérer les équipements existants"
                        onClick={() => trackNavigation('/equipements/edit', 'Gérer Équipements')}
                    >
                        <span>Gérer Équipements</span>
                        <ChevronRight size={20} className="management-arrow" />
                    </Link>

                    <Link
                        to="/equipements/edit?filter=expired"
                        className={`management-link ${expiredCount > 0 ? 'management-link-alert' : ''}`}
                        aria-label={expiredCount > 0 ? `Voir les ${expiredCount} équipements avec calibration expirée` : 'Voir tous les équipements'}
                        onClick={() => trackNavigation('/equipements/edit?filter=expired', 'Calibrations Expirées')}
                    >
                        <span className="flex items-center gap-2">
                            {expiredCount > 0 && <AlertCircle size={18} />}
                            Calibrations Expirées {expiredCount > 0 ? `(${expiredCount})` : '(0)'}
                        </span>
                        <ChevronRight size={20} className="management-arrow" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
