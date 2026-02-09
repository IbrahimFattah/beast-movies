import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getWatchlistHistory } from '../controllers/watchlistHistoryController';

const router = Router();

router.use(authMiddleware);

router.get('/', getWatchlistHistory);

export default router;
