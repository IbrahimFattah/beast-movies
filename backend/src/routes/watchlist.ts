import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../controllers/watchlistController';

const router = Router();

router.use(authMiddleware);

router.get('/', getWatchlist);
router.post('/', addToWatchlist);
router.delete('/:tmdbId', removeFromWatchlist);

export default router;
