import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

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

        await setDoc(doc(db, 'users', user.uid), {
            fullName,
            email,
            isApproved: false,
            createdAt: new Date().toISOString()
        });

        return userCredential;
    };

    const logout = () => {
        return signOut(auth);
    };

    useEffect(() => {
        let unsubscribeProfile = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Check if user profile exists
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    // This is a legacy user (exists in Auth but not in Firestore)
                    // We "grandfather" them in as approved
                    await setDoc(userDocRef, {
                        fullName: user.displayName || 'Utilisateur Existant',
                        email: user.email,
                        isApproved: true,
                        isLegacy: true,
                        createdAt: new Date().toISOString()
                    });
                }

                // Set up real-time listener for user profile
                unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setCurrentUser({ ...user, profile: docSnap.data() });
                    } else {
                        setCurrentUser(user);
                    }
                    setLoading(false);
                });
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
        isApproved: (currentUser?.profile?.isApproved === true),
        isAdmin: (currentUser?.profile?.isAdmin === true)
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
