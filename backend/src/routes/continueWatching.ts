import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
    getContinueWatching,
    upsertContinueWatching,
    removeContinueWatching,
} from '../controllers/continueWatchingController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getContinueWatching);
router.post('/', upsertContinueWatching);
router.delete('/:tmdbId', removeContinueWatching);

export default router;
