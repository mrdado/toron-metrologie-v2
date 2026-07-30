import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} from 'firebase/auth';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const register = async (email, password, fullName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        try {
            console.log('AuthContext: Creating Firestore doc for', user.uid);
            await setDoc(doc(db, 'users', user.uid), {
                fullName,
                email,
                isApproved: false,
                isAdmin: false,
                createdAt: new Date().toISOString()
            });
            console.log('AuthContext: Firestore doc created successfully');
        } catch (dbError) {
            console.error('AuthContext: Error creating Firestore document:', dbError);
            throw dbError;
        }

        return userCredential;
    };

    const logout = () => {
        return signOut(auth);
    };

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    useEffect(() => {
        let unsubscribeProfile = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);

                // Attach onSnapshot directly (single fast network hop)
                unsubscribeProfile = onSnapshot(
                    userDocRef,
                    (docSnap) => {
                        if (docSnap.exists()) {
                            setCurrentUser({ ...user, profile: docSnap.data() });
                        } else {
                            // Check if legacy user asynchronously without blocking load
                            const creationTime = user.metadata?.creationTime ? new Date(user.metadata.creationTime).getTime() : 0;
                            const now = Date.now();
                            const isNewUser = (now - creationTime) < 30000;

                            if (!isNewUser) {
                                setDoc(userDocRef, {
                                    fullName: user.displayName || 'Utilisateur Existant',
                                    email: user.email,
                                    isApproved: true,
                                    isLegacy: true,
                                    createdAt: new Date().toISOString()
                                }).catch(err => console.error('AuthContext: Error grandfathering user:', err));
                            }
                            setCurrentUser(user);
                        }
                        setLoading(false);
                    },
                    (profileErr) => {
                        console.error('AuthContext: Profile snapshot error:', profileErr);
                        setCurrentUser(user);
                        setLoading(false);
                    }
                );
            } else {
                if (unsubscribeProfile) unsubscribeProfile();
                setCurrentUser(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeProfile) unsubscribeProfile();
        };
    }, []);

    const value = {
        currentUser,
        login,
        register,
        logout,
        resetPassword,
        isApproved: (currentUser?.profile?.isApproved === true),
        isAdmin: (currentUser?.profile?.isAdmin === true)
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm font-medium text-gray-500">Chargement de l'application...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
