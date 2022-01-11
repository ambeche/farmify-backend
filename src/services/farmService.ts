import { QueryParameters } from './../types';
import sequelize from 'sequelize';
import Farm, { FarmData } from '../models/Farm';
import { FarmRecord } from '../types';
import { Op } from 'sequelize';

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
  let datetime = {};

  const filterByDate = (monthorYear: number, label: string) => ({
    [Op.and]: [
      sequelize.where(
        sequelize.fn('date_part', `${label}`, sequelize.col('datetime')),
        `${monthorYear}`
      ),
    ],
  });

  //const fromMonth = new Date('2018-12-31T22:00:00.000Z').toDateString();
  // filters applied to endpoint through query parameters
  // default limit and offset set
  if (query) {
    if (query.limit) options.limit = query.limit;
    if ((query.page && query.limit) || query.offset) {
      if (query.page && query.limit)
        options.offset = (query.page - 1) * query?.limit;
      else options.offset = query.offset;
    }
    if (query.metricType) where.metricType = query.metricType;

    if (query.year) datetime = { ...datetime, ...filterByDate(query.year, 'year') };
    if (query.month) datetime = { ...datetime, ...filterByDate(query.month, 'month') };
  }

  const farms = await FarmData.findAll({
    ...options,
    where: {
      ...where,
      ...datetime
    },
    include: {
      model: Farm,
      attributes: ['farmName'],
    },
    //group: [sequelize.fn('date_trunc', 'month', sequelize.col('farmData.datetime.id'))]
  });
  return farms;
};

export default { createFarm, getFarms };
