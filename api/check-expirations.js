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
        console.log('dateExpiration');
        console.log("Starting weekly expiration check...");
        console.log("Config Check: Service ID present:", !!process.env.VITE_EMAILJS_SERVICE_ID);
        console.log("Config Check: Public Key present:", !!process.env.VITE_EMAILJS_PUBLIC_KEY);
        console.log("Config Check: Private Key present:", !!process.env.EMAILJS_PRIVATE_KEY);

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

        console.log(`Found ${expiringEquipment.length} equipment(s) expiring soon:`, expiringEquipment.map(e => e.nom));

        if (expiringEquipment.length === 0) {
            return response.status(200).json({ message: "No expiring equipment found." });
        }

        // 2. Query users for alerts
        const userSnap = await db.collection('users')
            .where('expirationAlertsEnabled', '==', true)
            .get();

        const alertedUsers = [];
        userSnap.forEach(doc => alertedUsers.push(doc.data().email));

        console.log(`Found ${alertedUsers.length} user(s) to notify:`, alertedUsers);

        if (alertedUsers.length === 0) {
            return response.status(200).json({ message: "No users opted-in." });
        }

        // 3. Send emails individually for better reliability
        const equipmentList = expiringEquipment.map(e =>
            `- ${e.nom} (S/N: ${e.numeroSerie}) - Exp: ${e.dateExpiration}`
        ).join('\n');

        const results = [];
        for (const userEmail of alertedUsers) {
            const emailData = {
                service_id: process.env.VITE_EMAILJS_SERVICE_ID,
                template_id: process.env.VITE_EMAILJS_EXPIRATION_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID,
                user_id: process.env.VITE_EMAILJS_PUBLIC_KEY,
                accessToken: process.env.EMAILJS_PRIVATE_KEY,
                template_params: {
                    to_email: userEmail,
                    equipment_count: expiringEquipment.length,
                    equipment_details: equipmentList,
                    subject: "🚨 Alerte Expiration Équipements"
                }
            };

            console.log(`Sending email to: ${userEmail}...`);

            const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                body: JSON.stringify(emailData),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!emailResponse.ok) {
                const errorText = await emailResponse.text();
                console.error(`EmailJS Error for ${userEmail}:`, errorText);
                results.push({ email: userEmail, success: false, error: errorText });
            } else {
                console.log(`Email sent successfully to ${userEmail}`);
                results.push({ email: userEmail, success: true });
            }
        }

        const failedCount = results.filter(r => !r.success).length;
        if (failedCount > 0) {
            throw new Error(`Failed to send ${failedCount} out of ${alertedUsers.length} emails.`);
        }

        return response.status(200).json({
            success: true,
            notified: alertedUsers.length,
            equipment: expiringEquipment.length
        });

    } catch (error) {
        console.error("Cron Error:", error);
        return response.status(500).json({ error: error.message });
    }
}
