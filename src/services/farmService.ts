// all arguments have already been parsed and validated by middleware
// farmdataFilter and injected into Request object

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { FarmRecord } from './../types';
import Farm, { FarmData } from '../models/Farm';
import { Request } from 'express';
import sequelize from 'sequelize';

// adds a farm; farm is accociated with it's respective data
const createFarm = async (recordsOfRecords: FarmRecord[], owner: string) => {
  const newfarm = await Farm.create({
    farmname: recordsOfRecords[0].farmname,
    userUsername: owner,
  });

  const recordsWithForeignKey = recordsOfRecords.map((record) => ({
    ...record,
    farmFarmname: newfarm.farmname,
  }));

  const newFarmData = await FarmData.bulkCreate(recordsWithForeignKey);

  return newFarmData;
};

//farms with their associated data nested
const getFarms = async ({
  options,
  where,
  datetime,
}: Request): Promise<Farm[]> => {
  const farms = await Farm.findAll({
    include: {
      attributes: { exclude: ['farmFarmname'] },
      model: FarmData,
      ...options,
      where: {
        ...where,
        ...datetime,
      },
    },
  });
  return farms;
};

const getFarmData = async ({
  options,
  where,
  datetime,
}: Request): Promise<FarmRecord[]> => {
  const farmData = await FarmData.findAll({
    ...options,
    where: {
      ...where,
      ...datetime,
    },
    attributes: { exclude: ['farmFarmname'] },
  });
  console.log('query', where, options, datetime);

  return farmData;
};

const getFarmStatistics = async ({
  options,
  where,
  datetime,
}: Request): Promise<Farm[]> => {
  const farmStatistics = await FarmData.findAll({
    ...options,
    where: {
      ...where,
      ...datetime,
    },
    attributes: [
      // [sequelize.where(sequelize.fn(`pH`), sequelize.col('metricType')), 'metricType'],

      [sequelize.literal(`COUNT(*)`), 'numberofRecords'],
      [sequelize.fn('date_trunc', 'month', sequelize.col('datetime')), 'month'],
      'metricType',
      'farmname',
      [sequelize.fn('min', sequelize.col('farmData.metricValue')), 'min'],
      [sequelize.fn('max', sequelize.col('farmData.metricValue')), 'max'],
      [sequelize.fn('avg', sequelize.col('farmData.metricValue')), 'average'],
    ],
    order: [sequelize.fn('date_trunc', 'month', sequelize.col('datetime'))],
    group: ['farmname', 'metricType', 'month', 'farmname'],
  });

  return farmStatistics;
};

export default { createFarm, getFarms, getFarmData, getFarmStatistics };
