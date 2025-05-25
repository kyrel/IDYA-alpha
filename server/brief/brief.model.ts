import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.config';
import User from "../user/user.model";

export class Brief extends Model {
    declare public id: number;
    declare public ownerId: number;
    declare public title: string;
    declare public briefQuestions: BriefQuestion[];
}

Brief.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'Brief',
});

export class BriefQuestion extends Model {
    declare public id: number;
    declare public briefId: number;
    declare public questionText: string;    
}

BriefQuestion.init({
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
    modelName: 'BriefQuestion',
});

User.hasMany(Brief, { as: 'owner', foreignKey: { name: 'ownerId', allowNull: false} });
Brief.belongsTo(User, { as: 'owner' });

Brief.hasMany(BriefQuestion, { as: 'briefQuestions', foreignKey: { name: 'briefId', allowNull: false }, onDelete: 'CASCADE' });
BriefQuestion.belongsTo(Brief, { as: 'brief' });