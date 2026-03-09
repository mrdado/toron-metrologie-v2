import admin from 'firebase-admin';
import fetch from 'node-fetch';

// Initialize Firebase Admin consistently
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
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { fullName, email } = request.body;

    if (!fullName || !email) {
        return response.status(400).json({ error: 'Missing fullName or email' });
    }

    try {
        console.log(`[notify-admins] Starting notification for new user: ${email}`);

        // 1. Query Firestore for all admins (Admin SDK bypasses security rules)
        const adminsSnap = await db.collection('users')
            .where('isAdmin', '==', true)
            .get();

        const adminEmails = [];
        adminsSnap.forEach(doc => {
            const data = doc.data();
            if (data.email) {
                adminEmails.push(data.email);
            }
        });

        if (adminEmails.length === 0) {
            console.warn('[notify-admins] No admin users found.');
            return response.status(200).json({ message: 'No admins to notify.' });
        }

        console.log(`[notify-admins] Found ${adminEmails.length} admins. Sending emails...`);

        // 2. Send emails via EmailJS REST API
        const results = [];
        for (const adminEmail of adminEmails) {
            const emailData = {
                service_id: process.env.VITE_EMAILJS_SERVICE_ID,
                template_id: process.env.VITE_EMAILJS_TEMPLATE_ID,
                user_id: process.env.VITE_EMAILJS_PUBLIC_KEY,
                accessToken: process.env.EMAILJS_PRIVATE_KEY, // Note: EmailJS REST strictly requires the private key as accessToken
                template_params: {
                    admin_email: adminEmail,
                    from_name: 'IPS TestLAB System',
                    user_name: fullName,
                    user_email: email,
                    // Note: window.location.origin isn't available in Node, so we relative link or hardcode it
                    // Assuming the admin dashboard is just the base URL + /admin
                    admin_link: `https://${process.env.VERCEL_URL || 'votre-site.com'}/admin`
                }
            };

            const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                body: JSON.stringify(emailData),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!emailResponse.ok) {
                const errorText = await emailResponse.text();
                console.error(`[notify-admins] EmailJS Error for ${adminEmail}:`, errorText);
                results.push({ email: adminEmail, success: false, error: errorText });
            } else {
                console.log(`[notify-admins] Email sent successfully to ${adminEmail}`);
                results.push({ email: adminEmail, success: true });
            }
        }

        const failedCount = results.filter(r => !r.success).length;
        if (failedCount > 0) {
            console.error(`[notify-admins] Failed to send ${failedCount} out of ${adminEmails.length} emails.`);
            // Continue gracefully even if some fail
        }

        return response.status(200).json({ success: true, notifiedCount: adminEmails.length - failedCount });
    } catch (error) {
        console.error('[notify-admins] Server error:', error);
        return response.status(500).json({ error: error.message });
    }
}
