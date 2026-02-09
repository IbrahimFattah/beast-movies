import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getWatchedItems, markAsWatched, unmarkAsWatched } from '../controllers/watchedController';

const router = Router();

router.use(authMiddleware);

router.get('/', getWatchedItems);
router.post('/', markAsWatched);
router.delete('/:tmdbId', unmarkAsWatched);

export default router;
