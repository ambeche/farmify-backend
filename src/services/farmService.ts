// all arguments have already been parsed and validated by middleware
// farmdataFilter and injected into Request object

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { FarmifyServerError } from './../utils/parser';
import { FarmRecord } from './../types';
import Farm, { FarmData } from '../models/Farm';
import { Request } from 'express';
import sequelize from 'sequelize';

const farmDataCreator = async (
  recordsOfRecords: FarmRecord[],
  farm_farmname: string
): Promise<FarmData[]> => {
  const recordsWithForeignKey = recordsOfRecords.map((record) => ({
    ...record,
    farm_farmname,
  }));

  const newFarmData = await FarmData.bulkCreate(recordsWithForeignKey);

  return newFarmData;
};
// adds a farm; farm is accociated with it's respective data
const createFarm = async (recordsOfRecords: FarmRecord[], owner: string) => {
  const newfarm = await Farm.create({
    farmname: recordsOfRecords[0].farmname,
    user_username: owner,
  });

  const farmData = await farmDataCreator(recordsOfRecords, newfarm.farmname);
  return farmData;
};

const updateFarmWithData = async (
  recordsOfRecords: FarmRecord[],
  owner: string
) => {
  const farmExistsAndOwnedByUser = await Farm.findOne({
    where: {
      user_username: owner,
      farmname: recordsOfRecords[0].farmname,
    },
  });

  if (farmExistsAndOwnedByUser && farmExistsAndOwnedByUser.farmname)
    return await farmDataCreator(
      recordsOfRecords,
      farmExistsAndOwnedByUser?.farmname
    );
  FarmifyServerError.message =
    "Action forbidden, only a farm's owner can add records to a farm!";
  FarmifyServerError.name = 'FarmifyForbiddenError';
  throw FarmifyServerError;
};

//farms with their associated data nested
const getFarms = async ({
  options,
  where,
  datetime,
}: Request): Promise<Farm[]> => {
  const farms = await Farm.findAll({
    ...options,
    attributes: ['farmname', ['user_username', 'owner']],
    include: {
      attributes: { exclude: ['farm_farmname', 'farmFarmname'] },
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
    attributes: { exclude: ['farm_farmname', 'farmFarmname'] },
  });
  console.log('queryt', where, options, datetime);

  return farmData;
};

const getFarmStatistics = async ({
  options,
  where,
  datetime,
}: Request): Promise<FarmData[]> => {
  const farmStatistics = await FarmData.findAll({
    ...options,
    where: {
      ...where,
      ...datetime,
    },
    attributes: [
      [sequelize.literal(`COUNT(*)`), 'numberofRecords'],
      [sequelize.fn('date_trunc', 'month', sequelize.col('datetime')), 'month'],
      'metrictype',
      'farmname',
      [sequelize.fn('min', sequelize.col('farmdata.value')), 'min'],
      [sequelize.fn('max', sequelize.col('farmdata.value')), 'max'],
      [sequelize.fn('avg', sequelize.col('farmdata.value')), 'average'],
    ],
    order: [sequelize.fn('date_trunc', 'month', sequelize.col('datetime'))],
    group: ['farmname', 'metrictype', 'month'],
  });

  return farmStatistics;
};

export default {
  createFarm,
  getFarms,
  getFarmData,
  getFarmStatistics,
  updateFarmWithData,
};
