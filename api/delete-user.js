import admin from 'firebase-admin';

// Initialize Firebase Admin (shared pattern from check-expirations.js)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { uid } = request.body;

    if (!uid) {
        return response.status(400).json({ error: 'Missing user UID' });
    }

    try {
        // 1. Delete from Firebase Authentication
        await admin.auth().deleteUser(uid);

        // 2. Delete from Firestore (the doc ID equals the Auth UID)
        await admin.firestore().collection('users').doc(uid).delete();

        return response.status(200).json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return response.status(500).json({ error: error.message });
    }
}
