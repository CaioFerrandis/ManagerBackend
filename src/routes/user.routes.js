import { Router } from 'express';
import { getUsers, updateUserTeam, updateProfile } from '../controllers/user.controllers.js';

const router = Router();

router.get('/', getUsers);
router.patch('/:id/team', updateUserTeam);
router.put('/profile', updateProfile);

export default router;
