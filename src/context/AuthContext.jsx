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
            throw dbError; // Rethrow to let the UI handle it
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

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Check if user profile exists
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    // Check if this is a brand new user (created in the last 30 seconds)
                    const creationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : 0;
                    const now = Date.now();
                    const isNewUser = (now - creationTime) < 30000;

                    if (!isNewUser) {
                        // This is a legacy user (exists in Auth but not in Firestore)
                        // We "grandfather" them in as approved
                        console.log('AuthContext: Legacy user detected, creating profile for', user.uid);
                        try {
                            await setDoc(userDocRef, {
                                fullName: user.displayName || 'Utilisateur Existant',
                                email: user.email,
                                isApproved: true,
                                isLegacy: true,
                                createdAt: new Date().toISOString()
                            });
                        } catch (setDocError) {
                            console.error('AuthContext: Error grandfathering user:', setDocError);
                        }
                    } else {
                        console.log('AuthContext: New user detected, skipping legacy profile creation logic');
                    }
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
        resetPassword,
        isApproved: (currentUser?.profile?.isApproved === true),
        isAdmin: (currentUser?.profile?.isAdmin === true)
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
