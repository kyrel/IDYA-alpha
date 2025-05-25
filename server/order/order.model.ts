// server/order/order.model.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.config';
import User from "../user/user.model";

class Order extends Model {
    declare public id: number;
    declare public customerId: number;
    declare public executantId: number;
    declare public status: string;
    declare public deadline: Date | null;
    declare public presentation: string | null; // Добавлено поле presentation
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
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
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
    priceFrom: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    priceTo: {
        type: DataTypes.DECIMAL,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Order',
});

User.hasMany(Order, { as: 'customer', foreignKey: { name: 'customerId', allowNull: false} });
User.hasMany(Order, { as: 'executant', foreignKey: { name: 'executantId', allowNull: true } });
Order.belongsTo(User, { as: 'customer' });
Order.belongsTo(User, { as: 'executant' });

export default Order;