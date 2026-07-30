import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    collection,
    addDoc,
    onSnapshot,
    doc,
    deleteDoc,
    updateDoc,
    query,
    orderBy,
    getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { uploadCertificate, deleteFiles } from '../utils/blob';
import { parseAnyDate } from '../utils/dateUtils';

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [torons, setTorons] = useState([]);
    const [equipements, setEquipements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Subscribe to Torons with automatic real-time data sanitization
    useEffect(() => {
        if (!currentUser) {
            setTorons([]);
            return;
        }

        const q = query(collection(db, 'torons'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => {
                const raw = doc.data() || {};
                return {
                    id: doc.id,
                    ...raw,
                    fournisseur: raw.fournisseur !== undefined && raw.fournisseur !== null ? String(raw.fournisseur).trim() : '',
                    diametre: raw.diametre !== undefined && raw.diametre !== null ? String(raw.diametre).trim() : '',
                    grade: raw.grade !== undefined && raw.grade !== null ? String(raw.grade).trim() : '',
                    utilisation: raw.utilisation !== undefined && raw.utilisation !== null ? String(raw.utilisation).trim() : 'Precontrainte',
                    identification: raw.identification !== undefined && raw.identification !== null ? String(raw.identification).trim() : '',
                    essais: raw.essais !== undefined && raw.essais !== null ? String(raw.essais).trim() : '',
                    certificates: Array.isArray(raw.certificates) ? raw.certificates : []
                };
            });
            setTorons(data);
        }, (err) => {
            console.error("Error fetching torons:", err);
        });
        return () => unsubscribe();
    }, [currentUser]);

    // Subscribe to Equipment with automatic real-time data sanitization
    useEffect(() => {
        if (!currentUser) {
            setEquipements([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(collection(db, 'equipements'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => {
                const raw = doc.data() || {};
                return {
                    id: doc.id,
                    ...raw,
                    nom: raw.nom !== undefined && raw.nom !== null ? String(raw.nom).trim() : 'Équipement sans nom',
                    type: raw.type !== undefined && raw.type !== null ? String(raw.type).trim() : 'Divers',
                    dateCalibration: parseAnyDate(raw.dateCalibration),
                    dateExpiration: parseAnyDate(raw.dateExpiration),
                    etalonnage: raw.etalonnage !== undefined && raw.etalonnage !== null ? String(raw.etalonnage).trim() : '',
                    certificates: Array.isArray(raw.certificates) ? raw.certificates : []
                };
            });
            setEquipements(data);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching equipments:", err);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

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
                        throw new Error(`Upload falhou para "${file.name}": ${uploadErr.message}. Certifique-se de estar usando 'vercel dev' para desenvolvimento local.`);
                    }
                }
                console.log("Files uploaded:", uploadedFiles.length);
            }

            const cleanData = JSON.parse(JSON.stringify(data));
            const docData = {
                ...cleanData,
                certificates: uploadedFiles,
                createdAt: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, 'torons'), docData);
            console.log("Toron saved with ID:", docRef.id);
            return docRef.id;
        } catch (err) {
            console.error("Error adding toron:", err);
            throw err;
        }
    };

    const addEquipment = async (data, files = []) => {
        try {
            let uploadedFiles = [];
            if (files.length > 0) {
                console.log("Uploading files...");
                for (const file of files) {
                    try {
                        const url = await uploadCertificate(file, file.name);
                        if (url) {
                            uploadedFiles.push({
                                name: String(file.name),
                                type: String(file.type),
                                size: Number(file.size),
                                url: String(url)
                            });
                        }
                    } catch (uploadErr) {
                        console.error("Upload failed for equipment:", uploadErr);
                        throw new Error(`Upload falhou: ${uploadErr.message}`);
                    }
                }
            }

            const cleanData = JSON.parse(JSON.stringify(data));
            const docData = {
                ...cleanData,
                certificates: uploadedFiles,
                createdAt: new Date().toISOString()
            };

            const docRef = await addDoc(collection(db, 'equipements'), docData);
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
                    try {
                        const url = await uploadCertificate(file, file.name);
                        if (url) {
                            updatedCertificates.push({
                                name: String(file.name),
                                type: String(file.type),
                                size: Number(file.size),
                                url: String(url)
                            });
                        }
                    } catch (uploadErr) {
                        console.error("Upload failed during update:", uploadErr);
                        throw new Error(`Upload falhou: ${uploadErr.message}`);
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

    const updateEquipment = async (id, data, newFiles = []) => {
        try {
            const docRef = doc(db, 'equipements', id);
            let updatedCertificates = data.certificates || [];

            if (newFiles.length > 0) {
                console.log("Uploading additional files...");
                for (const file of newFiles) {
                    try {
                        const url = await uploadCertificate(file, file.name);
                        if (url) {
                            updatedCertificates.push({
                                name: String(file.name),
                                type: String(file.type),
                                size: Number(file.size),
                                url: String(url)
                            });
                        }
                    } catch (uploadErr) {
                        console.error("Upload failed during update:", uploadErr);
                        throw new Error(`Upload falhou: ${uploadErr.message}`);
                    }
                }
            }

            const cleanData = JSON.parse(JSON.stringify(data));
            await updateDoc(docRef, {
                ...cleanData,
                certificates: updatedCertificates
            });
        } catch (err) {
            console.error("Error updating equipment:", err);
            throw err;
        }
    };

    const deleteItem = async (type, id) => {
        try {
            const collectionName = (type === 'toron' || type === 'torons') ? 'torons' : 'equipements';
            const docRef = doc(db, collectionName, id);

            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.certificates && data.certificates.length > 0) {
                    const urls = data.certificates.map(c => c.url);
                    console.log(`Deleting associated files for ${type}:`, urls);
                    try {
                        await deleteFiles(urls);
                    } catch (fileErr) {
                        console.error("Warning: Failed to delete associated files:", fileErr);
                    }
                }
            }

            await deleteDoc(docRef);
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
