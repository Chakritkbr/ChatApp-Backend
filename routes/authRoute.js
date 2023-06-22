import express from 'express';
import {
  getOlderMessages,
  getOnlinePeople,
  getProfileController,
  loginController,
  logoutController,
  registerController,
  testController,
} from '../controllers/authController.js';

const router = express.Router();

//test get
router.get('/test', testController);

//get profile
router.get('/profile', getProfileController);

//register:Post
router.post('/register', registerController);

//login:Post
router.post('/login', loginController);

//get older messages
router.get('/messages/:userId', getOlderMessages);

// get online people

router.get('/people', getOnlinePeople);
//logout
router.post('/logout', logoutController);

export default router;
