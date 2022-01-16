import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../utils/db';
import { FarmRecord, MetricType } from '../types';
import User from './User';

interface FarmAttributes {
  farmname: string;
  user_username?: string; //pk of farm owner
  id?: number;
}

type FarmInput = Optional<FarmAttributes, 'id'>;
interface FarmRecordAttributes extends FarmRecord {
  farm_farmname?: string; // pk of farm
  id?: number;
  user_sername?: string;
}

class FarmData
  extends Model<FarmRecordAttributes>
  implements FarmRecordAttributes
{
  declare farmname: string;
  declare datetime?: Date;
  declare metrictype: MetricType;
  declare value: number;
  declare id: number;
}

FarmData.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    farmname: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
    datetime: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    metrictype: {
      type: DataTypes.ENUM('pH', 'rainFall', 'temperature'),
      allowNull: false,
    },
    value: {
      type: new DataTypes.FLOAT(),
      allowNull: false,
    },
    farm_farmname: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: 'farms', key: 'farmname' },
    },
  },
  {
    modelName: 'farmdata',
    tableName: 'farmdata',
    timestamps: false,
    sequelize,
    underscored: true,
  }
);

class Farm extends Model<FarmAttributes, FarmInput> {
  declare farmname: string;
  declare user_username?: string;
  declare id?: number;
}

Farm.init(
  {
    farmname: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    user_username: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: 'users', key: 'username' },
    },
  },
  {
    modelName: 'farm',
    timestamps: false,
    sequelize,
    underscored: true,
  }
);

// A one-many association set between Farm and Farmdata (foreign key in FarmData
Farm.belongsTo(User);
User.hasMany(Farm);
FarmData.belongsTo(Farm);
Farm.hasMany(FarmData);

export {
  Farm as default,
  FarmData,
  User,
  FarmRecordAttributes,
  FarmAttributes,
  FarmInput,
};
