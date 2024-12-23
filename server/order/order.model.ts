// server/order/order.model.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.config';

class Order extends Model {
    public id!: number;
    public customerId!: number;
    public executantId!: number;
    public status!: string;
    public deadline!: Date | null;
    public presentation!: string | null; // Добавлено поле presentation
}

Order.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    executantId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    presentation: {
        type: DataTypes.STRING,
        allowNull: true, // Поле может быть пустым
    },
}, {
    sequelize,
    modelName: 'Order',
});

export default Order;