import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/db';

interface UserAttributes {
  username: string;
  passwordHash: string;
  id?: number;
}

class User extends Model<UserAttributes> implements UserAttributes {
  declare username: string;
  declare passwordHash: string;
}

User.init(
  {
    username: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  },
  {
    modelName: 'user',
    sequelize,
  }
);

export default User;
