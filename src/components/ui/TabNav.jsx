import React from 'react';

const TabNav = ({ tabs, activeTab, onTabChange, variant = 'toron' }) => {
    const isEquipment = variant === 'equipment';
    const buttonClass = isEquipment ? 'btn-equipment' : 'btn-primary';
    
    return (
        <div className="flex gap-2 mb-6 w-full">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex-1 btn btn-sm transition-all ${
                        activeTab === tab.id
                            ? buttonClass
                            : 'btn-outline'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default TabNav;
