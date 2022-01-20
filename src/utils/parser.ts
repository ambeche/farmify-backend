import { UserInput } from './../models/User';
import { UserInputForValidation } from './../types';
import * as Fs from 'fs';
import path = require('path');
import { FARM_FIELDS } from './constants';
import {
  FarmRecord,
  MetricType,
  QueryParametersForValidation,
  QueryParameters,
} from './../types';
import csvParser = require('csv-parser');

export const ValidationError = new Error('Validation error');
ValidationError.name = 'ValidationError';

export const FarmifyServerError = new Error();
FarmifyServerError.name = 'FarmifyServerError';

const assertNever = (arg: never): never => {
  throw new Error(`Unexpected value type: ${JSON.stringify(arg)}`);
};

const isString = (arg: unknown): arg is string => {
  return typeof arg === 'string' || arg instanceof String;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseMetricType = (metricType: any): MetricType | undefined => {
  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const type = metricType?.toLowerCase();
  if (type === 'rainfall') return 'rainFall' as MetricType.Rainfall;
  if (type === 'ph') return 'pH' as MetricType.PH;
  if (type === 'temperature') return 'temperature' as MetricType.Temperature;

  return;
};

const isDatetime = (date: unknown): date is Date => {
  return isString(date) && Boolean(Date.parse(date));
};

const parseDatetime = (date: unknown): Date | undefined => {
  if (!isDatetime(date)) throw new Error(`'invalid date type' ${date}`);
  return new Date(date);
};

const parseString = (stringValue: unknown): string => {
  if (!stringValue || !isString(stringValue))
    throw new Error(`invalid data type: ${stringValue}`);
  return stringValue;
};

const parseQueryParamNumber = (numberValue: unknown): number | undefined => {
  if (!numberValue || !isString(numberValue) || isNaN(Number(numberValue)))
    return;

  return Number(numberValue);
};

const parseMetricValue = (value: unknown, type: unknown): number => {
  if (!value || isNaN(Number(value)))
    throw new Error(`invalid parameter: ${value}`);
  const metricValue = Number(value);
  const metricType = parseMetricType(type);
  switch (metricType) {
    case MetricType.PH:
      if (metricValue >= 0 && metricValue <= 14) return metricValue;
      break;
    case MetricType.Rainfall:
      if (metricValue >= 0 && metricValue <= 500) return metricValue;
      break;
    case MetricType.Temperature:
      if (metricValue >= -50 && metricValue <= 100) return metricValue;
      break;
    default:
      throw new Error(`unknown metric type: ${metricType}`);
  }
  return metricValue;
};

const parseAndValidateQueryParameters = ({
  month: mon,
  year: yr,
  limit: lim,
  offset: off,
  metrictype: met,
  page: pg,
  farmname: fname,
}: QueryParametersForValidation): QueryParameters => {
  const validatedPageNumber = parseQueryParamNumber(pg);
  const page =
    validatedPageNumber && validatedPageNumber > 0 ? validatedPageNumber : 1;
  return {
    month: parseQueryParamNumber(mon),
    year: parseQueryParamNumber(yr),
    limit: parseQueryParamNumber(lim),
    offset: parseQueryParamNumber(off),
    metrictype: parseMetricType(met),
    page: page,
    farmname: fname ? parseString(fname) : '',
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseAndValidateFarmRecord = ({
  farmname: name,
  datetime: date,
  metrictype: type,
  value: mvalue,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any): FarmRecord | undefined => {
  const farmname = parseString(name);
  const datetime = parseDatetime(date);
  const metrictype = parseMetricType(type);
  const value = parseMetricValue(mvalue, type);
  if (!farmname || !datetime || !metrictype || value === (null || undefined)) {
    throw new Error(
      `ValidationError: incorrect or malformatted record discarded! {${name} ${date} ${type} ${value}}`
    );
  }
  return {
    farmname,
    datetime,
    metrictype,
    value,
  };
};

const getCsvFiles = (fileFromClient?: string): string[] => {
  if (fileFromClient) return [fileFromClient];

  const csvDataFolderPath = path.join('./data/initialFarms');
  console.log('current1 ', csvDataFolderPath);
  const filesOnServer = Fs.readdirSync(csvDataFolderPath).map((filename) =>
    path.join(csvDataFolderPath, filename)
  );
  console.log('current 2', csvDataFolderPath);
  return filesOnServer;
};

const parseCsvFiles = (fileFromClient?: string): Promise<FarmRecord[][]> => {
  const ValidationError = new Error(
    'invalid file format, only csv text files are allowed!'
  );
  ValidationError.name = 'ValidationError';

  if (fileFromClient && !(path.extname(fileFromClient) === '.csv')) {
    ValidationError.message =
      'invalid file format, only csv text files are allowed!';
    throw ValidationError;
  }
  const filepaths = fileFromClient
    ? getCsvFiles(fileFromClient)
    : getCsvFiles();
  //console.log('current', getCsvFiles());

  return new Promise((resolve, reject) => {
    try {
      const allFarmsRecords: Array<FarmRecord>[] = [];
      for (const path of filepaths) {
        const singleFarmRecords: FarmRecord[] = [];
        const fileStream = Fs.createReadStream(path);
        fileStream
          .pipe(csvParser({ headers: FARM_FIELDS, skipLines: 1 }))
          .on('data', (data) => {
            try {
              const record = parseAndValidateFarmRecord(data);
              if (record) singleFarmRecords.push(record);
            } catch (error) {
              if (error instanceof Error)
                console.log(
                  'parseError: record discarded',
                  error.message,
                  data
                );
            }
          })
          .on('end', () => {
            console.log('parsing done!');
            if (allFarmsRecords[0].length === 0) {
              ValidationError.message = 'missing or malformated records!';
              reject(ValidationError);
            }

            resolve(allFarmsRecords);
          });
        allFarmsRecords.push(singleFarmRecords);
      }
    } catch (error: unknown) {
      if (error instanceof Error) console.log('parse error', error.message);
    }
  });
};

const parseUserInput = ({
  username: usr,
  password: pass,
}: UserInputForValidation): UserInput | undefined => {
  try {
    const username = parseString(usr);
    const password = parseString(pass);

    return { username, password };
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
  }
  return;
};

export default {
  getCsvFiles,
  parseCsvFiles,
  parseAndValidateFarmRecord,
  assertNever,
  parseString,
  parseUserInput,
  parseAndValidateQueryParameters,
};
