import * as Fs from 'fs';
import path = require('path');
import csvParser = require('csv-parser');
import { FARM_FIELDS } from './constants';
import { FarmRecord, MetricType } from './../types';

const assertNever = (arg: never): never => {
  throw new Error(`Unexpected value type: ${JSON.stringify(arg)}`);
};

const isString = (arg: unknown): arg is string => {
  return typeof arg === 'string' || arg instanceof String;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isMetricEnumType = (metricType: any): metricType is MetricType => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Object.values(MetricType).includes(metricType);
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
    throw new Error('invalid data type');
  return stringValue;
};

const parseMetricType = (type: unknown): MetricType => {
  if (!type || !isMetricEnumType(type))
    throw new Error(`invalid metric type: ${type}`);
  return type;
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
      assertNever(metricType);
  }
  return metricValue;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseAndValidateFarmRecord = ({
  farmName: name,
  datetime: date,
  metricType: type,
  metricValue: value,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any): FarmRecord => {
  const farmName = parseString(name);
  const datetime = parseDatetime(date);
  const metricType = parseMetricType(type);
  const metricValue = parseMetricValue(value, type);
  if (
    !farmName ||
    !datetime ||
    !metricType ||
    metricValue === (null || undefined)
  ) {
    throw new Error(
      `ValidationError: incorrect or malformatted record discarded! {${name} ${date} ${type} ${value}}`
    );
  }
  return {
    farmName,
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
              singleFarmRecords.push(parseAndValidateFarmRecord(data));
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
};
