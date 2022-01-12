import { FarmRecord } from './../types';
import Farm, { FarmData } from '../models/Farm';
import { Request } from 'express';

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

//farms with their associated data nested
const getFarms = async (filters: Request): Promise<Farm[]> => {
  const farms = await Farm.findAll({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    include: {
      model: FarmData,
      ...filters.options,
      attributes: { exclude: ['farmFarmName'] },
      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: {
        ...filters.where,
        ...filters.datetime,
      },
    },
  });
  return farms;
};

const getFarmData = async ({options, where, datetime}: Request): Promise<FarmRecord[]>=> {
  
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const farms = await FarmData.findAll({
    ...options,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    where: {
      ...where,
      ...datetime,
    },
    include: {
      model: Farm,
      attributes: ['farmName'],
    },
  });
  return farms;
};

export default { createFarm, getFarms, getFarmData };
