import { QueryParameters } from './../types';
import { NextFunction, Response, Request, ErrorRequestHandler } from 'express';
import parseAndValidate from '../utils/parser';
import { Op } from 'sequelize';
import sequelize from 'sequelize';
import multer, { MulterError } from 'multer';
import { TOKEN_SECRET } from './config';
import * as jwt from 'jsonwebtoken';

const farmDataFilter = (req: Request, _res: Response, next: NextFunction) => {
  const validatedQueries = parseAndValidate.parseAndValidateQueryParameters(
    req.query
  );
  const where: QueryParameters = {};
  const options: QueryParameters = { limit: 25, offset: 0 };
  let datetime = {};

  const filterByDate = (monthorYear: number, label: string) => ({
    [Op.and]: [
      sequelize.where(
        sequelize.fn('date_part', `${label}`, sequelize.col('datetime')),
        `${monthorYear}`
      ),
    ],
  });

  // filters applied to endpoint through validated query
  // parameters(metric, farm name, month, year, page)
  // middleware applied to all farm endpoints
  if (validatedQueries) {
    if (validatedQueries.limit) options.limit = validatedQueries.limit;
    if (
      (validatedQueries.page && validatedQueries.limit) ||
      validatedQueries.offset
    ) {
      if (validatedQueries.page && validatedQueries.limit)
        options.offset = (validatedQueries.page - 1) * validatedQueries?.limit;
      else options.offset = validatedQueries.offset;
    }
    if (validatedQueries.metrictype)
      where.metrictype = validatedQueries.metrictype;
    if (validatedQueries.farmname) where.farmname = validatedQueries.farmname;
    if (validatedQueries.user_username)
      where.user_username = validatedQueries.user_username;

    if (validatedQueries.year)
      datetime = {
        ...datetime,
        ...filterByDate(validatedQueries.year, 'year'),
      };
    if (validatedQueries.month)
      datetime = {
        ...datetime,
        ...filterByDate(validatedQueries.month, 'month'),
      };
  }
  req.options = options;
  req.datetime = datetime;
  req.where = where;
  console.log('validated queries', validatedQueries);

  next();
};

const validationErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  next
) => {
  try {
    if (
      error instanceof MulterError ||
      (error.name === 'ValidationError' && error instanceof Error)
    ) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (
      error.name === 'SequelizeUniqueConstraintError' ||
      (error.name === 'SequelizeDatabaseError' &&
        error.message === 'SequelizeDatabaseError')
    ) {
      res
        .status(400)
        .json({ error: ` ${error.message}, field must be unique!` });
      console.log('sq error', error);

      return;
    }
    if (error.name === 'FarmifyForbiddenError' && error instanceof Error) {
      res.status(403).json({ error: error.message });
      return;
    }

    res.status(404).json({ error: 'resource not found' });
    console.error('nam of err', error);
    next();
    return;
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
  }
};

const storage = multer.diskStorage({
  destination: './data/newFarms',
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!file.originalname.includes('.csv')) {
    console.log('filename', file.originalname);

    return cb(null, false);
  }
  cb(null, true);
};

const csvFileUploader = multer({ storage: storage, fileFilter }).single(
  'farmdata'
);

// extract token from authorization header
const bearerTokenExtractor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = req.get('authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(
        auth.substring(7),
        parseAndValidate.parseString(TOKEN_SECRET)
      );
    } catch {
      res.status(401).json({ error: 'invalid token!' });
    }
  } else {
    res.status(401).json({ error: 'Missing token!' });
  }
  next();
};

export default {
  farmDataFilter,
  validationErrorHandler,
  csvFileUploader,
  bearerTokenExtractor,
};
