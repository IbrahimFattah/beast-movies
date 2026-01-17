import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoritesController';

const router = Router();

router.use(authMiddleware);

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:tmdbId', removeFavorite);

export default router;
