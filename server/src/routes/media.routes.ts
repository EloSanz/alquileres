import { Elysia, t } from 'elysia';
import { MediaController } from '../controllers/media.controller';

const mediaController = new MediaController();

export const mediaRoutes = new Elysia({ prefix: '/media' })
    .post('/upload', mediaController.upload, {
        body: t.Object({
            image: t.String()
        }),
        detail: {
            tags: ['Media'],
            summary: 'Upload image to Cloudinary'
        }
    });
