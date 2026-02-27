import { Router } from 'express';
import { generateText, getHistory, generateImage, processImage, getImageHistory } from '../controllers/aiController.js';
import { protect } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import { generateTextSchema } from '../validators/aiValidators.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = Router();

// All AI routes are protected
router.use(protect);

router.post('/generate-text', validate(generateTextSchema), generateText);
router.get('/history', getHistory);

// Image APIs
router.post('/generate-image', generateImage);
router.post('/process-image', upload.single('image'), processImage);
router.get('/image-history', getImageHistory);

export default router;
