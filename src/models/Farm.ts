import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../utils/db';
import { FarmRecord, MetricType } from '../types';

interface FarmAttributes {
   farmName: string;
   id?: number;
}

type FarmInput = Optional<FarmAttributes, 'id'>;
type FarmRecordAttributes = FarmRecord;


class FarmData
  extends Model<FarmRecordAttributes>
  implements FarmRecordAttributes
{
  public farmName!: string;
  public datetime?: Date;
  public metricType!: MetricType;
  public metricValue!: number;
  public id!: number;
}



FarmData.init(
  {
    farmName: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metricType: {
      type: DataTypes.ENUM('pH', 'rainFall', 'temperature'),
      allowNull: false,
    },
    metricValue: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'farmData',
    sequelize,
  }
);

class Farm extends Model<FarmAttributes, FarmInput> {
  public farmName!: string;
  public id!: number;
}

Farm.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    farmName: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
  },
  {
    tableName: 'farms',
    sequelize,
  }
);

FarmData.removeAttribute('id'); // primary key excluded

// A one-many association set between Farm and FarmData (foreign key in FarmData)
Farm.hasMany(FarmData);
FarmData.belongsTo(Farm);
void Farm.sync();
void FarmData.sync();

export { Farm as default, FarmData, FarmRecordAttributes, FarmAttributes, FarmInput };
