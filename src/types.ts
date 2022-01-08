export enum MetricType {
  PH = 'pH',
  Temperature = 'temperature',
  Rainfall = 'rainFall',
}

export interface FarmRecord {
  farmName: string;
  datetime?: Date;
  metricType: MetricType;
  metricValue: number;
}

export type FarmRecordValidationInput = {
  farmName: unknown;
  datetime: unknown;
  metricType: unknown;
  metricValue: unknown;
};
