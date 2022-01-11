import { QueryParameters } from './../types';
//import sequelize from 'sequelize';
import Farm, { FarmData } from '../models/Farm';
import { FarmRecord } from '../types';

// adds a farm; farm is accociated with it's respective data
const createFarm = async (recordsOfRecords: FarmRecord[]) => {
  const newfarm = await Farm.create({ farmName: recordsOfRecords[0].farmName });

  const recordsWithForeignKey = recordsOfRecords.map((record) => ({
    ...record,
    farmFarmName: newfarm.farmName,
  }));
  const newFarmData = await FarmData.bulkCreate(recordsWithForeignKey);

  return newFarmData;
};

const getFarms = async (query?: QueryParameters) => {
  const where: QueryParameters = {};
  const options: QueryParameters = { limit: 20, offset: 0 };

  console.log('farm log', Boolean(query?.metricType));

  // filters applied to endpoint through query parameters
  // default limit and offset set
  if (query) {
    if (query.limit) options.limit = query.limit;
    if ((query.page && query.limit) || query.offset) {
      if (query.page && query.limit)
        options.offset = (query.page -1) * query?.limit;
      else options.offset = query.offset;
    }
    if (query.metricType) where.metricType = query.metricType;
  }

  const farms = await FarmData.findAll({
    ...options,
    where,
    attributes: { exclude: ['farmFarmName'] },
    include: {
      model: Farm,
      attributes: ['farmName'],
    },
  });
  return farms;
};

export default { createFarm, getFarms };
