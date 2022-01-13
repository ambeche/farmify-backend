import { FarmRecord } from './../types';
import express from 'express';
import parseAndValidate from '../utils/parser';
import farmService from '../services/farmService';
import middleWare from '../utils/middleWare';

const farmRouter = express.Router();

farmRouter
  .route('/')
  .get(middleWare.farmDataFilter, async (req, res) => {
    try {
      const farmsWithRecords = await farmService.getFarms(req);
      res.json(farmsWithRecords);
    } catch (error) {
      if (error instanceof Error) console.log('QueriesError', error);
    }
  })
  .post(async (_req, res) => {
    try {
      const records: FarmRecord[][] = await parseAndValidate.parseCsvFiles();
      const addedRecords = await farmService.createFarm(records[3]);
      res.json(addedRecords);
    } catch (error) {
      if (error instanceof Error) console.log('addFarmError', error);
    }
  });

farmRouter.get('/data', middleWare.farmDataFilter, async (req, res) => {
  try {
    const farmdata = await farmService.getFarmData(req);
    res.json(farmdata);
  } catch (error) {
    if (error instanceof Error) console.log('QueriesError', error);
  }
});

farmRouter.get('/statistics', middleWare.farmDataFilter, async (req, res) => {
  try {
    const farmStatistics = await farmService.getFarmStatistics(req);
    res.json(farmStatistics);
  } catch (error) {
    if (error instanceof Error) console.log('QueriesError', error);
  }
});

export default farmRouter;
