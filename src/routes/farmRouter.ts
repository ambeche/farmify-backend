import { FarmRecord } from './../types';
import express from 'express';
import parseAndValidate from '../utils/parser';
import farmService from '../services/farmService';

const farmRouter = express.Router();

farmRouter
  .route('/')
  .get(async (_req, res) => {
    //const records = await parseAndValidate.parseCsvFiles();
    const records = await farmService.getFarms();
    res.json(records);
  })
  .post(async (req, res) => {
    try {
      console.log('data', req.body);

      const records: FarmRecord[][] = await parseAndValidate.parseCsvFiles();
      const addedRecords = await farmService.createFarm(records[1]);
      res.json(addedRecords);
    } catch (error) {
      if (error instanceof Error) console.log('addFarmError', error);
    }
  });

export default farmRouter;
