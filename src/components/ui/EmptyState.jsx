import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Plus } from 'lucide-react';

const EmptyState = ({ 
    type = 'toron', 
    message = "Aucun élément trouvé",
    showAction = true 
}) => {
    const navigate = useNavigate();

    const config = {
        toron: {
            icon: Package,
            title: "Aucun toron",
            description: "Commencez par ajouter votre premier toron au système",
            actionText: "Ajouter un Toron",
            actionPath: "/torons/add",
            color: "purple"
        },
        equipment: {
            icon: Package,
            title: "Aucun équipement",
            description: "Commencez par ajouter votre premier équipement au système",
            actionText: "Ajouter un Équipement",
            actionPath: "/equipements/add",
            color: "teal"
        },
        search: {
            icon: Search,
            title: "Aucun résultat",
            description: message || "Essayez d'ajuster vos critères de recherche",
            showAction: false,
            color: "gray"
        }
    };

    const current = config[type] || config.search;
    const Icon = current.icon;

    const getBgColor = () => {
        if (current.color === 'purple') return 'bg-purple-100';
        if (current.color === 'teal') return 'bg-teal-100';
        return 'bg-gray-100';
    };

    const getIconColor = () => {
        if (current.color === 'purple') return 'text-purple-400';
        if (current.color === 'teal') return 'text-teal-400';
        return 'text-gray-400';
    };

    const getButtonClass = () => {
        if (current.color === 'purple') return 'btn-primary';
        if (current.color === 'teal') return 'btn-equipment';
        return 'btn-dark';
    };

    return (
        <div className="text-center py-16 px-4 animate-fade-in">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${getBgColor()} flex items-center justify-center`}>
                <Icon 
                    size={40} 
                    className={getIconColor()}
                    strokeWidth={1.5}
                />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
                {current.title}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {current.description}
            </p>
            {showAction && current.showAction !== false && (
                <button
                    onClick={() => navigate(current.actionPath)}
                    className={`btn ${getButtonClass()} inline-flex`}
                >
                    <Plus size={20} />
                    {current.actionText}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
