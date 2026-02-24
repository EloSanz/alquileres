import { uploadImage } from '../lib/cloudinary';

export class MediaController {
    upload = async ({ body }: { body: { image: string } }) => {
        if (!body.image) {
            throw new Error('No image provided');
        }

        try {
            // Cloudinary's upload method accepts base64 strings
            const result = await uploadImage(body.image);

            return {
                success: true,
                message: 'Image uploaded successfully',
                data: {
                    url: result.secure_url,
                    publicId: result.public_id
                }
            };
        } catch (error: any) {
            console.error('[MediaController] Upload error:', error);
            throw new Error('Failed to upload image to Cloudinary');
        }
    };
}
