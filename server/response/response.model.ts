import { DataTypes, Model } from 'sequelize';
import sequelize from "../config/db.config";
import Order from "../order/order.model";
import User from "../user/user.model";

class Response extends Model {
    declare public id: number;
    declare public orderId: number;
    declare public userId: number;
    declare public message: string;
    declare public proposedDeadline: Date | null;
}

Response.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        proposedDeadline: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Response',
    }
);

Order.hasMany(Response, { foreignKey: { name: 'orderId', allowNull: false} });
Response.belongsTo(Order, { foreignKey: { name: 'orderId', allowNull: false} });
Response.belongsTo(User, { foreignKey: 'userId' });

export default Response;
