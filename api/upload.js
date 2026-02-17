import { handleUpload } from '@vercel/blob/client';

export default async function handler(request, response) {
    const body = request.body;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                /*
                 * Generate a client token for the browser to upload the file.
                 * You can add custom logic here to control which users can upload.
                 */
                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'application/pdf'],
                    tokenPayload: JSON.stringify({
                        // optional, sent to your server on upload completion
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // This is called once the upload is completed on Vercel's end.
                console.log('Upload completed:', blob.url);
            },
        });

        return response.status(200).json(jsonResponse);
    } catch (error) {
        return response.status(400).json({ error: error.message });
    }
}
