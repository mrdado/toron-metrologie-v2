import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    collection,
    addDoc,
    onSnapshot,
    doc,
    deleteDoc,
    updateDoc,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
    const [torons, setTorons] = useState([]);
    const [equipements, setEquipements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Subscribe to Torons
    useEffect(() => {
        const q = query(collection(db, 'torons'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTorons(data);
        }, (err) => {
            console.error("Error fetching torons:", err);
            // Don't set global error to avoid blocking UI if just one collection fails
        });
        return () => unsubscribe();
    }, []);

    // Subscribe to Equipment
    useEffect(() => {
        const q = query(collection(db, 'equipements'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEquipements(data);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching equipments:", err);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const addToron = async (data, files = []) => {
        try {
            console.log("addToron called with:", data, files);

            // Convert files to Base64 (no Storage needed)
            const uploadedFiles = [];
            if (files.length > 0) {
                console.log("Converting files to Base64...");
                for (const file of files) {
                    // Read file as Base64
                    const base64 = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });

                    uploadedFiles.push({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: base64 // Base64 string
                    });
                }
                console.log("Files converted:", uploadedFiles.length);
            }

            // Save to Firestore with timeout
            console.log("Saving to Firestore...");

            const savePromise = addDoc(collection(db, 'torons'), {
                ...data,
                certificates: uploadedFiles,
                createdAt: new Date().toISOString()
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Firestore timeout - vérifiez les règles de sécurité")), 10000)
            );

            const docRef = await Promise.race([savePromise, timeoutPromise]);

            console.log("Toron saved with ID:", docRef.id);
            return docRef.id;
        } catch (err) {
            console.error("Error adding toron:", err);
            console.error("Error details:", err.code, err.message);
            throw err;
        }
    };

    const addEquipment = async (data) => {
        try {
            console.log("addEquipment called with:", data);
            const docRef = await addDoc(collection(db, 'equipements'), {
                ...data,
                createdAt: new Date().toISOString()
            });
            console.log("Equipment saved with ID:", docRef.id);
            return docRef.id;
        } catch (err) {
            console.error("Error adding equipment:", err);
            throw err;
        }
    };

    const updateToron = async (id, data) => {
        const docRef = doc(db, 'torons', id);
        await updateDoc(docRef, data);
    };

    const updateEquipment = async (id, data) => {
        const docRef = doc(db, 'equipements', id);
        await updateDoc(docRef, data);
    };

    const deleteItem = async (id, type) => {
        try {
            const collectionName = type === 'toron' ? 'torons' : 'equipements';
            await deleteDoc(doc(db, collectionName, id));
        } catch (err) {
            console.error("Error deleting item:", err);
            throw err;
        }
    };

    const value = {
        torons,
        equipements,
        loading,
        error,
        addToron,
        addEquipment,
        updateToron,
        updateEquipment,
        deleteItem
    };

    return (
        <InventoryContext.Provider value={value}>
            {children}
        </InventoryContext.Provider>
    );
};
