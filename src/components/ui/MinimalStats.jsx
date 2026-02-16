import React from 'react';

const MinimalStats = ({ toronCount = 0, equipmentCount = 0, expiredCount = 0 }) => {
    return (
        <div className="minimal-stats">
            <div className="minimal-stat">
                <div className="minimal-stat-number">{toronCount}</div>
                <div className="minimal-stat-label">Torons</div>
            </div>
            <div className="minimal-stat">
                <div className="minimal-stat-number">{equipmentCount}</div>
                <div className="minimal-stat-label">Équip.</div>
            </div>
            <div className={`minimal-stat ${expiredCount > 0 ? 'minimal-stat-alert' : ''}`}>
                <div className="minimal-stat-number">{expiredCount}</div>
                <div className="minimal-stat-label">Exp.</div>
            </div>
        </div>
    );
};

export default MinimalStats;
