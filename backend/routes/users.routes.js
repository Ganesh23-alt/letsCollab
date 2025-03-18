import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import {body } from 'express-validator';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

//register user 
router.post('/register',
    body('email').isEmail().withMessage('Email must be valid email address'),
    body('password').isLength({min:3}).withMessage('Password must be atleast 8 characters'),

    //confirm password if needed
    // body('confirmPassword').isLength({min:3}).withMessage('Password did not match'),
    userController.createUserController
    );

//login user
router.post('/login',
    body('email').isEmail().withMessage('Email must be valid email address'),
    body('password').isLength({min:3}).withMessage('Password must be of 8 characters long'),
    userController.loginUserController
);

//get user profile 
router.get('/profile', 
authMiddleware.authUser,
userController.userProfileController
);

//logout router 
router.get('/logout',
    authMiddleware.authUser,
    userController.userLogoutController
);

router.get('/all',authMiddleware.authUser, userController.getAllUsersController)

export default router;