/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

const assertNever = (arg: never): never => {
  throw new Error(`Unexpected value type: ${JSON.stringify(arg)}`);
};

const isString = (arg: unknown): arg is string => {
  return typeof arg === 'string' || arg instanceof String;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseMetricType = (metricType: any): MetricType | undefined => {
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
  metricType: met,
  page: pg,
  farmName,
}: QueryParametersForValidation): QueryParameters | undefined => {
  try {
    const validatedPageNumber = parseQueryParamNumber(pg);
    const page =
      validatedPageNumber && validatedPageNumber > 0 ? validatedPageNumber : 1;
    const month = parseQueryParamNumber(mon);
    const year = parseQueryParamNumber(yr);
    const limit = parseQueryParamNumber(lim);
    const offset = parseQueryParamNumber(off);
    const metricType = parseMetricType(met);
    const farmname = parseString(farmName);
    return {
      month,
      year,
      limit,
      offset,
      metricType,
      page: page,
      farmname,
    };
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
  }
  return;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseAndValidateFarmRecord = ({
  farmname: name,
  datetime: date,
  metricType: type,
  metricValue: value,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any): FarmRecord | undefined => {
  const farmname = parseString(name);
  const datetime = parseDatetime(date);
  const metricType = parseMetricType(type);
  const metricValue = parseMetricValue(value, type);
  if (
    !farmname ||
    !datetime ||
    !metricType ||
    metricValue === (null || undefined)
  ) {
    throw new Error(
      `ValidationError: incorrect or malformatted record discarded! {${name} ${date} ${type} ${value}}`
    );
  }
  return {
    farmname,
    datetime,
    metricType,
    metricValue,
  };
};

const getCsvFiles = (fileFromClient?: string): string[] => {
  if (fileFromClient) return [path.join('./', fileFromClient)];

  const csvDataFolderPath = path.join('./data');
  const filesOnServer = Fs.readdirSync(csvDataFolderPath).map((filename) =>
    path.join(csvDataFolderPath, filename)
  );
  return filesOnServer;
};

const parseCsvFiles = (fileFromClient?: string): Promise<FarmRecord[][]> => {
  const filepaths = fileFromClient
    ? getCsvFiles(fileFromClient)
    : getCsvFiles();
  console.log('current', getCsvFiles());

  return new Promise((resolve) => {
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
            resolve(allFarmsRecords);
          });
        allFarmsRecords.push(singleFarmRecords);
      }
    } catch (error: unknown) {
      if (error instanceof Error) console.log('parse error', error.message);
    }
  });
};

export default {
  getCsvFiles,
  parseCsvFiles,
  parseAndValidateFarmRecord,
  assertNever,
  parseString,
  parseAndValidateQueryParameters,
};
