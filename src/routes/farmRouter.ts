import { FarmRecord } from './../types';
import express from 'express';
import parseAndValidate from '../utils/parser';
import farmService from '../services/farmService';

const farmRouter = express.Router();

farmRouter
  .route('/')
  .get(async (req, res) => {
    try {
      console.log('query', req.query);
      const validatedQueries = parseAndValidate.parseAndValidateQueryParameters(req.query);
      console.log('query', validatedQueries);
      const records = await farmService.getFarms(validatedQueries);
      
      res.json(records);
    } catch (error) {
      if (error instanceof Error) console.log('queryError',error.message);
    }
  })
  .post(async (req, res) => {
    try {
      console.log('data', req.body);

      const records: FarmRecord[][] = await parseAndValidate.parseCsvFiles();
      const addedRecords = await farmService.createFarm(records[3]);
      res.json(addedRecords);
    } catch (error) {
      if (error instanceof Error) console.log('addFarmError', error);
    }
  });

export default farmRouter;
