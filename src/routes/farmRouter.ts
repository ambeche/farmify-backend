import { FarmRecord } from './../types';
import express from 'express';
import parseAndValidate from '../utils/parser';
import farmService from '../services/farmService';
import middleWare from '../utils/middleWare';

const farmRouter = express.Router();

farmRouter
  .route('/')
  .get(middleWare.farmDataFilter, async (req, res, next) => {
    try {
      const farmsWithRecords = await farmService.getFarms(req);
      res.json(farmsWithRecords);
    } catch (error: unknown) {
      next(error);
    }
  })
  .post(async (_req, res, next) => {
    try {
      const records: FarmRecord[][] = await parseAndValidate.parseCsvFiles();
      const addedRecords = await farmService.createFarm(records[3]);
      res.json(addedRecords);
    } catch (error: unknown) {
      next(error);
    }
  });

farmRouter.get('/data', middleWare.farmDataFilter, async (req, res, next) => {
  try {
    const farmdata = await farmService.getFarmData(req);
    res.json(farmdata);
  } catch (error) {
    next(error);
  }
});

farmRouter.get(
  '/statistics',
  middleWare.farmDataFilter,
  async (req, res, next) => {
    try {
      const farmStatistics = await farmService.getFarmStatistics(req);
      res.json(farmStatistics);
    } catch (error: unknown) {
      next(error);
    }
  }
);

export default farmRouter;
