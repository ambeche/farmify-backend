import { Model, DataTypes } from 'sequelize';
import { FarmRecord } from '../types';
import { sequelize } from '../utils/db';

interface UserAttributes {
  username: string;
  password: string;
  createdAt?: string;
  farms?: Pick<FarmRecord, 'farmname'>[];
}
export type UserInput = UserAttributes;
class User extends Model<UserAttributes> implements UserAttributes {
  declare username: string;
  declare password: string;
  declare createdAt: string;
  declare farms?: Pick<FarmRecord, 'farmname'>[];
}

User.init(
  {
    username: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  },
  {
    modelName: 'user',
    sequelize,
    underscored: true,
    timestamps: false,
  }
);

export default User;
