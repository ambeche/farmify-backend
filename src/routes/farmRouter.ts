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

  .post( middleWare.bearerTokenExtractor, middleWare.csvFileUploader, async (req, res, next) => {
    try {
      console.log('file', req.file, req.body);
     if(req.decodedToken.username){
      if (!req.file?.path)
      return res.status(400).json({
        error:
          'missing or invalid file format, only csv text file is allowed!',
      });

    const records: FarmRecord[][] = await parseAndValidate.parseCsvFiles(
      req.file.path
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const addedRecords = await farmService.createFarm(records[0], req.decodedToken.username);
    return res.json(addedRecords);
     }
    } catch (error: unknown) {
      next(error);
    }
    return;
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
    return;
  }
);

export default farmRouter;
