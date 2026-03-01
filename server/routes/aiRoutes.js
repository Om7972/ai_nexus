import { Router } from 'express';
import { generateText, getHistory, generateImage, processImage, getImageHistory } from '../controllers/aiController.js';
import { protect } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import { generateTextSchema } from '../validators/aiValidators.js';
import upload from '../middlewares/uploadMiddleware.js';
import { checkUsageLimit } from '../middlewares/usageLimitMiddleware.js';

const router = Router();

// All AI routes are protected
router.use(protect);

// Apply validation and usage limits
router.post('/generate-text', validate(generateTextSchema), checkUsageLimit, generateText);
router.get('/history', getHistory);

// Image APIs
router.post('/generate-image', checkUsageLimit, generateImage);
router.post('/process-image', upload.single('image'), checkUsageLimit, processImage);
router.get('/image-history', getImageHistory);

export default router;
