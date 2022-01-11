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

export interface QueryParameters {
  month?: number;
  limit?: number;
  offset?: number;
  page?: number;
  metricType?: MetricType;
}

export type QueryParametersForValidation = {
  month?: unknown;
  limit?: unknown;
  offset?: unknown;
  metricType?: unknown;
  page?: unknown;
};

export type FarmRecordValidationInput = {
  farmName: unknown;
  datetime: unknown;
  metricType: unknown;
  metricValue: unknown;
};
