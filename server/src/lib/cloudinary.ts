import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload an image to Cloudinary
 * @param filePath Path to the file or a base64 string/URL
 * @param publicId Optional public ID for the uploaded asset
 * @returns Promise with the upload result
 */
export const uploadImage = async (
    filePath: string,
    publicId?: string
): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            filePath,
            {
                public_id: publicId,
            },
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return reject(error);
                }
                if (!result) {
                    return reject(new Error('Cloudinary upload return undefined result'));
                }
                resolve(result);
            }
        );
    });
};

/**
 * Get an optimized URL for an image
 * @param publicId The public ID of the image
 * @returns Optimized URL
 */
export const getOptimizedUrl = (publicId: string): string => {
    return cloudinary.url(publicId, {
        fetch_format: 'auto',
        quality: 'auto'
    });
};

/**
 * Get a thumbnail URL for an image (auto-crop to square)
 * @param publicId The public ID of the image
 * @param width Thumbnail width (default 500)
 * @param height Thumbnail height (default 500)
 * @returns Thumbnail URL
 */
export const getThumbnailUrl = (
    publicId: string,
    width: number = 500,
    height: number = 500
): string => {
    return cloudinary.url(publicId, {
        crop: 'auto',
        gravity: 'auto',
        width,
        height,
    });
};

export default cloudinary;
