import { DataTypes, Model } from 'sequelize';
import sequelize from "../config/db.config";
import Order from "../order/order.model";

export class BriefSendout extends Model {
    declare public id: number;
    declare public orderId: number;    
}

BriefSendout.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        }        
    },
    {
        sequelize,
        modelName: 'BriefSendout',
    }
);

export class BriefSendoutQuestion extends Model {
    declare public id: number;
    declare public briefSendoutId: number;
    declare public questionText: string;    
}

BriefSendoutQuestion.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    questionText: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'BriefSendoutQuestion',
});

Order.hasMany(BriefSendout, { foreignKey: { name: 'orderId', allowNull: false} });
BriefSendout.belongsTo(Order, { foreignKey: { name: 'orderId', allowNull: false} });

BriefSendout.hasMany(BriefSendoutQuestion, {
    as: 'briefSendoutQuestions',
    foreignKey: { name: 'briefSendoutId', allowNull: false },
    onDelete: 'CASCADE' 
});
BriefSendoutQuestion.belongsTo(BriefSendout, { as: 'briefSendout' });
