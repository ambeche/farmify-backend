import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../utils/db';
import { FarmRecord, MetricType } from '../types';

interface FarmAttributes {
  farmname: string;
  id?: number;
}

type FarmInput = Optional<FarmAttributes, 'id'>;
interface FarmRecordAttributes extends FarmRecord {
  farmFarmName?: string;
  id?: number;
}

class FarmData
  extends Model<FarmRecordAttributes>
  implements FarmRecordAttributes
{ 
  declare farmname: string;
  declare datetime?: Date;
  declare metricType: MetricType;
  declare metricValue: number;
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
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    datetime: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    metricType: {
      type: DataTypes.ENUM('pH', 'rainFall', 'temperature'),
      allowNull: false,
    },
    metricValue: {
      type: new DataTypes.FLOAT(),
      allowNull: false,
    },
  },
  {
    modelName: 'farmData',
    timestamps: false,
    sequelize,
  }
);

class Farm extends Model<FarmAttributes, FarmInput> {
  declare farmname: string;
  declare id: number;
}

Farm.init(
  {
    farmname: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
  },
  {
    modelName: 'farm',
    timestamps: false,
    sequelize,
  }
);

// A one-many association set between Farm and Farmdata (foreign key in FarmData)
Farm.hasMany(FarmData);
FarmData.belongsTo(Farm);
void Farm.sync();
void FarmData.sync();

export {
  Farm as default,
  FarmData,
  FarmRecordAttributes,
  FarmAttributes,
  FarmInput,
};
