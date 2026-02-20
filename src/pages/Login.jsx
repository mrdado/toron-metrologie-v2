import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginCard from '../components/auth/LoginCard';
import '../styles/MeshBackground.css';
import emailjs from '@emailjs/browser';

const Login = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingApproval, setPendingApproval] = useState(false);
    const { login, register, logout, currentUser, isApproved } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (currentUser && isApproved) {
            navigate('/');
        } else if (params.get('pending') === 'true' || (currentUser && !isApproved)) {
            setPendingApproval(true);
        }
    }, [location, currentUser, isApproved, navigate]);

    const handleLogin = async (email, password) => {
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Échec de la connexion. Vérifiez vos identifiants.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (email, password, fullName) => {
        try {
            setError('');
            setLoading(true);
            await register(email, password, fullName);

            // Send Admin Notification via EmailJS
            try {
                const templateParams = {
                    admin_email: 'mrdado@gmail.com', // Recipient
                    from_name: 'IPS TestLAB System',
                    user_name: fullName,
                    user_email: email,
                    admin_link: `${window.location.origin}/admin`
                };

                console.log('Sending EmailJS with params:', templateParams);

                const response = await emailjs.send(
                    import.meta.env.VITE_EMAILJS_SERVICE_ID,
                    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                    templateParams,
                    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
                );
                console.log('Email notification sent successfully!', response);
            } catch (emailErr) {
                console.error('Email notification failed with error:', emailErr);
            }

            setPendingApproval(true);
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Cet email est déjà utilisé.');
            } else {
                setError('Échec de l\'inscription. Veuillez réessayer.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setPendingApproval(false);
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden relative">
            <div className="mesh-background"></div>

            <LoginCard
                onLogin={handleLogin}
                onRegister={handleRegister}
                onLogout={handleLogout}
                error={error}
                loading={loading}
                pendingApproval={pendingApproval}
            />
        </div>
    );
};

export default Login;
