import * as dotenv from 'dotenv';

dotenv.config();

const jwtConfig = {
    secret: process.env.JWT_SECRET!,
    expiresIn: '1h', // Время жизни токена
};

export default jwtConfig;
