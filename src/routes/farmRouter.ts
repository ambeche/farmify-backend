import { FarmRecord } from './../types';
import express from 'express';
import parseAndValidate from '../utils/parser';
import farmService from '../services/farmService';
import middleWare from '../utils/middleWare';
import { NextFunction, Response, Request } from 'express';

const farmRouter = express.Router();

const confirmTokenAndParseFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('file', req.file, req.body);
    if (req.decodedToken.username) {
      if (!req.file?.path)
        return res.status(400).json({
          error:
            'missing or invalid file format, only csv text file is allowed!',
        });

      const records: FarmRecord[][] = await parseAndValidate.parseCsvFiles(
        req.file.path
      );

      return records;
    }
  } catch (error: unknown) {
    return next(error);
  }
};

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

  .post(
    middleWare.bearerTokenExtractor,
    middleWare.csvFileUploader,
    async (req, res, next) => {
      try {
        console.log('file', req.file, req.body);
        const records = (await confirmTokenAndParseFiles(
          req,
          res,
          next
        )) as FarmRecord[][];
        const addedRecords = await farmService.createFarm(
          records[0],
          parseAndValidate.parseString(req.decodedToken.username)
        );
        return res.json(addedRecords);
      } catch (error: unknown) {
        next(error);
      }
      return;
    }
  );

farmRouter
  .route('/data')
  .get(middleWare.farmDataFilter, async (req, res, next) => {
    try {
      const farmdata = await farmService.getFarmData(req);
      res.json(farmdata);
    } catch (error) {
      next(error);
    }
  })
  .post(
    middleWare.bearerTokenExtractor,
    middleWare.csvFileUploader,
    async (req, res, next) => {
      try {
        const recordsForFarmUpdate = (await confirmTokenAndParseFiles(
          req,
          res,
          next
        )) as FarmRecord[][];

        const farmdata = await farmService.updateFarmWithData(
          recordsForFarmUpdate[0],
          parseAndValidate.parseString(req.decodedToken.username)
        );
        res.json(farmdata);
      } catch (error) {
        next(error);
      }
    }
  );

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
