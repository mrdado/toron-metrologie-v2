import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { currentUser, isApproved } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (!isApproved) {
        return <Navigate to="/login?pending=true" replace />;
    }

    return children;
};

export default PrivateRoute;
