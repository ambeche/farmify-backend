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

const getFarms = async () => {
  const farms = await Farm.findAll({
    include: {
      model: FarmData,
      attributes: { exclude: ['farmFarmName', 'id'] }
    }
  });
  return farms;
};

export default { createFarm, getFarms };
