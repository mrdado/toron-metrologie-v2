import { upload } from '@vercel/blob/client';

/**
 * Uploads a file to Vercel Blob storage securely.
 * @param {File} file - The file to upload.
 * @param {string} fileName - The name for the file in storage.
 * @returns {Promise<string>} - The URL of the uploaded file.
 */
export const uploadCertificate = async (file, fileName) => {
    try {
        const blob = await upload(`certificates/${fileName}`, file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
        });
        return blob.url;
    } catch (error) {
        console.error('Error uploading to Vercel Blob:', error);
        throw error;
    }
};

/**
 * Deletes files from Vercel Blob storage securely via API.
 * @param {string[]} urls - The URLs of the files to delete.
 */
export const deleteFiles = async (urls) => {
    if (!urls || urls.length === 0) return;
    try {
        const response = await fetch('/api/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete files');
        }
    } catch (error) {
        console.error('Error deleting from Vercel Blob:', error);
    }
};
