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

import { uploadCertificate, deleteFiles } from '../utils/blob';

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

            const uploadedFiles = [];
            if (files.length > 0) {
                console.log("Uploading files to Vercel Blob...");
                for (const file of files) {
                    try {
                        const url = await uploadCertificate(file, file.name);
                        if (url) {
                            uploadedFiles.push({
                                name: String(file.name || 'document'),
                                type: String(file.type || 'application/octet-stream'),
                                size: Number(file.size || 0),
                                url: String(url)
                            });
                        }
                    } catch (uploadErr) {
                        console.error("Failed to upload file:", file.name, uploadErr);
                        // We continue with other files or throw depending on importance
                    }
                }
                console.log("Files uploaded:", uploadedFiles.length);
            }

            // Sanitize data to ensure it's a plain object with no undefined/complex types
            const cleanData = JSON.parse(JSON.stringify(data));

            const docData = {
                ...cleanData,
                certificates: uploadedFiles,
                createdAt: new Date().toISOString()
            };

            console.log("Saving to Firestore with sanitized data...");

            const savePromise = addDoc(collection(db, 'torons'), docData);

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Firestore timeout - verifique a conexão ou permissões")), 15000)
            );

            const docRef = await Promise.race([savePromise, timeoutPromise]);

            console.log("Toron saved with ID:", docRef.id);
            return docRef.id;
        } catch (err) {
            console.error("Error adding toron:", err);
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

    const updateToron = async (id, data, newFiles = []) => {
        try {
            const docRef = doc(db, 'torons', id);

            let updatedCertificates = data.certificates || [];

            if (newFiles.length > 0) {
                console.log("Uploading additional files...");
                for (const file of newFiles) {
                    const url = await uploadCertificate(file, file.name);
                    if (url) {
                        updatedCertificates.push({
                            name: String(file.name),
                            type: String(file.type),
                            size: Number(file.size),
                            url: String(url)
                        });
                    }
                }
            }

            const cleanData = JSON.parse(JSON.stringify(data));
            await updateDoc(docRef, {
                ...cleanData,
                certificates: updatedCertificates
            });
        } catch (err) {
            console.error("Error updating toron:", err);
            throw err;
        }
    };

    const updateEquipment = async (id, data) => {
        const docRef = doc(db, 'equipements', id);
        await updateDoc(docRef, data);
    };

    const deleteItem = async (type, id) => {
        try {
            if (type === 'toron') {
                // Get the toron data first to find certificate URLs
                const docRef = doc(db, 'torons', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.certificates && data.certificates.length > 0) {
                        const urls = data.certificates.map(c => c.url);
                        console.log("Deleting associated files:", urls);
                        await deleteFiles(urls);
                    }
                }
            }

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
