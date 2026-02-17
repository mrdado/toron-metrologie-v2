import { del } from '@vercel/blob';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls)) {
        return response.status(400).json({ error: 'Invalid URLs provided' });
    }

    try {
        // Vercel Blob 'del' can take an array of urls
        await del(urls);
        return response.status(200).json({ success: true });
    } catch (error) {
        console.error('Error deleting blobs:', error);
        return response.status(500).json({ error: error.message });
    }
}
