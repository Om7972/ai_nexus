import { Router } from 'express';
import { generateText, getHistory } from '../controllers/aiController.js';
import { protect } from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validate.js';
import { generateTextSchema } from '../validators/aiValidators.js';

const router = Router();

// All AI routes are protected
router.use(protect);

router.post('/generate-text', validate(generateTextSchema), generateText);
router.get('/history', getHistory);

export default router;
