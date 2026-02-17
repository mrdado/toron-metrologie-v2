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
