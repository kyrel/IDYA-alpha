import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.config';

class User extends Model {
    public id!: number;
    public nickname!: string;
    public role!: 'executant' | 'customer';
    public password!: string;
    public phone?: string;
    public email!: string;
    public telegram?: string;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('executant', 'customer'),
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        telegram: {
            type: DataTypes.STRING,
        },
    },
    {
        sequelize,
        modelName: 'User',
    }
);

export default User;
