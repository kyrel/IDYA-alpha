import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import sequelize from './config/db.config';
import orderRoutes from "./order/order.routes";
import userRoutes from "./user/user.routes";
import responseRoutes from "./response/response.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/users', userRoutes);


sequelize.sync()
    .then(() => {
        console.log('Database connected');
    })
    .catch((error) => {
        console.error('Error connecting to database', error);
    });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});