import { QueryParameters } from './../types';
import { NextFunction, Response, Request } from 'express';
import parseAndValidate from '../utils/parser';
import { Op } from 'sequelize';
import sequelize from 'sequelize';

const farmDataFilter = (req: Request, _res: Response, next: NextFunction) => {
  const validatedQueries = parseAndValidate.parseAndValidateQueryParameters(
    req.query
  );
  const where: QueryParameters = {};
  const options: QueryParameters = { limit: 4, offset: 0 };
  let datetime = {};

  const filterByDate = (monthorYear: number, label: string) => ({
    [Op.and]: [
      sequelize.where(
        sequelize.fn('date_part', `${label}`, sequelize.col('datetime')),
        `${monthorYear}`
      ),
    ],
  });

  // filters applied to endpoint through validated query parameters
  // default limit and offset set
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
    if (validatedQueries.metricType)
      where.metricType = validatedQueries.metricType;

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

  next();
};

export default {farmDataFilter};
