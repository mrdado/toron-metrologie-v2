import { put } from '@vercel/blob';

/**
 * Uploads a file to Vercel Blob storage.
 * @param {File} file - The file to upload.
 * @param {string} path - The path/name for the file in storage.
 * @returns {Promise<string>} - The URL of the uploaded file.
 */
export const uploadCertificate = async (file, fileName) => {
    try {
        const blob = await put(`certificates/${Date.now()}-${fileName}`, file, {
            access: 'public',
            token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN,
        });
        return blob.url;
    } catch (error) {
        console.error('Error uploading to Vercel Blob:', error);
        throw error;
    }
};
