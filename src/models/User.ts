import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/db';

interface UserAttributes {
  username: string;
  password: string;
  createdAt?: string;
}
export type UserInput = UserAttributes;
class User extends Model<UserAttributes> implements UserAttributes {
  declare username: string;
  declare password: string;
  id: any;
  name: any;
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
    tableName: 'users',
    modelName: 'user',
    sequelize,
  }
);

export default User;
