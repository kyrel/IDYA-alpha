import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.config';
import { RequestHandler } from 'express';
import User from './user.model';

// Регистрация
export const register: RequestHandler = async (req, res) => {
    try {
        const { email, password, role, nickname, phone, telegram } = req.body;

        // Проверка на наличие всех полей
        if (!email || !password || !role || !nickname) {
            res.status(400).json({ message: 'Email, password, nickname and role are required' });
            return;
        }

        // Проверка на корректность значения роли
        const validRoles = ['executant', 'customer'];
        if (!validRoles.includes(role)) {
            res.status(400).json({ message: 'Role must be either "executant" or "customer"' });
            return;
        }

        // Проверка на существование пользователя с таким email
        const existingUserByEmail = await User.findOne({ where: { email } });
        if (existingUserByEmail) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }

        // Проверка на существование пользователя с таким nickname
        const existingUserByNickname = await User.findOne({ where: { nickname } });
        if (existingUserByNickname) {
            res.status(400).json({ message: 'User with this nickname already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            role,
            nickname,
            phone,
            telegram,
        });

        const token = jwt.sign({ user: newUser }, jwtConfig.secret, { expiresIn: '1d' });

        res.status(201).json({
            message: 'User registered successfully',
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Вход
export const login: RequestHandler = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Проверка на наличие всех полей
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }

        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const token = jwt.sign({ user: user }, jwtConfig.secret, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful',
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Профиль
export const profile: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;  // ID пользователя из JWT токена
        console.log(req.user)
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }  // Исключаем пароль из ответа
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
