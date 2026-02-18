import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
    if (type === 'card') {
        return (
            <>
                {[...Array(count)].map((_, index) => (
                    <div key={index} className="card animate-pulse">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                                {/* Title skeleton */}
                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                
                                {/* Badges skeleton */}
                                <div className="flex gap-2">
                                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                                    <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                                </div>
                                
                                {/* Description skeleton */}
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            
                            {/* Action buttons skeleton */}
                            <div className="flex gap-2">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </>
        );
    }

    if (type === 'stats') {
        return (
            <div className="minimal-stats animate-pulse">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="minimal-stat">
                        <div className="h-5 bg-gray-200 rounded w-8 mx-auto mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
                    </div>
                ))}
            </div>
        );
    }

    return null;
};

export default LoadingSkeleton;
