import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import {body } from 'express-validator';

const router = Router();

router.post('/register',
body('email').isEmail().withMessage('Email must be valid email address'),
body('password').isLength({min:3}).withMessage('Password must be atleast 8 characters'),
userController.createUserController);


export default router;