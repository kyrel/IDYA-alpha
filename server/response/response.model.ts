import { DataTypes, Model } from 'sequelize';
import sequelize from "../config/db.config";
import Order from "../order/order.model";
import User from "../user/user.model";

class Response extends Model {
    public id!: number;
    public orderId!: number;
    public userId!: number;
    public message!: string;
    public proposedDeadline!: Date;
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
            allowNull: false,
        },
        proposedDeadline: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Response',
    }
);

Response.belongsTo(Order, { foreignKey: 'orderId' });
Response.belongsTo(User, { foreignKey: 'userId' });

export default Response;
