import admin from 'firebase-admin';
import fetch from 'node-fetch';

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

export default async function handler(request, response) {
    // Basic protection (optional: add a CRON_SECRET check)

    try {
        console.log("Starting weekly expiration check...");

        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 60);

        const todayStr = today.toISOString().split('T')[0];
        const futureStr = futureDate.toISOString().split('T')[0];

        // 1. Query equipment (bypasses security rules via Admin SDK)
        const eqSnap = await db.collection('equipements')
            .where('dateExpiration', '>=', todayStr)
            .where('dateExpiration', '<=', futureStr)
            .get();

        const expiringEquipment = [];
        eqSnap.forEach(doc => expiringEquipment.push({ id: doc.id, ...doc.data() }));

        if (expiringEquipment.length === 0) {
            return response.status(200).json({ message: "No expiring equipment found." });
        }

        // 2. Query users for alerts
        const userSnap = await db.collection('users')
            .where('expirationAlertsEnabled', '==', true)
            .get();

        const alertedUsers = [];
        userSnap.forEach(doc => alertedUsers.push(doc.data().email));

        if (alertedUsers.length === 0) {
            return response.status(200).json({ message: "No users opted-in." });
        }

        // 3. Format & Send via EmailJS
        const equipmentList = expiringEquipment.map(e =>
            `- ${e.nom} (S/N: ${e.numeroSerie}) - Exp: ${e.dateExpiration}`
        ).join('\n');

        const emailData = {
            service_id: process.env.VITE_EMAILJS_SERVICE_ID,
            template_id: process.env.VITE_EMAILJS_EXPIRATION_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID,
            user_id: process.env.VITE_EMAILJS_PUBLIC_KEY,
            template_params: {
                to_emails: alertedUsers.join(','),
                equipment_count: expiringEquipment.length,
                equipment_details: equipmentList,
                subject: "🚨 Alerte Expiration Équipements"
            }
        };

        const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            body: JSON.stringify(emailData),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!emailResponse.ok) {
            throw new Error(`EmailJS Error: ${await emailResponse.text()}`);
        }

        return response.status(200).json({ success: true, count: expiringEquipment.length });

    } catch (error) {
        console.error("Cron Error:", error);
        return response.status(500).json({ error: error.message });
    }
}
