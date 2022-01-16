import { QueryInterface } from 'sequelize';
import { DataTypes } from 'sequelize';
import { sequelize } from './src/utils/db';

async function up(context: QueryInterface) {
  context = sequelize.getQueryInterface();
  await context.createTable('farmdata', {
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
    metrictype: {
      type: DataTypes.ENUM('pH', 'rainFall', 'temperature'),
      allowNull: false,
    },
    value: {
      type: new DataTypes.FLOAT(),
      allowNull: false,
    },
  });
  await context.createTable('farms', {
    farmname: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
  });
  await context.createTable('users', {
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
  });
  await context.addColumn('farms', 'user_username', {
    type: DataTypes.STRING,
    allowNull: false,
    references: { model: 'users', key: 'username' },
  });
  await context.addColumn('farmdata', 'farm_farmname', {
    type: DataTypes.STRING,
    allowNull: false,
    references: { model: 'farms', key: 'farmname' },
  });
}

async function down(context: QueryInterface) {
  context = sequelize.getQueryInterface();
  await context.dropTable('farmdata');
  await context.dropTable('farms');
  await context.dropTable('users');
}
export { up, down };
