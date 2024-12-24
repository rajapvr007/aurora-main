import express from 'express';
const router = express.Router();
import { 
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    getUserByID,
    deleteUser,
    updateUser
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';


router.route('/').get(protect, admin, getUsers).post(registerUser);
router.post('/auth', authUser);
router.post('/logout', logoutUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/:id').delete(protect, admin, deleteUser).get(protect, admin, getUserByID).put(protect, admin, updateUser);

export default router;