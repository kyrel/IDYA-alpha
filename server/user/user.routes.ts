import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {login, profile, register} from "./user.controller";

const router = express.Router();

// Роут для регистрации пользователя
router.post('/register', register);

// Роут для авторизации пользователя
router.post('/login', login);

// Пример защищённого роутера для проверки авторизации (доступ только с токеном)
router.get('/profile', authenticate, profile);

export default router;
