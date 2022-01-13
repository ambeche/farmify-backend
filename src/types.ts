export enum MetricType {
  PH = 'pH',
  Temperature = 'temperature',
  Rainfall = 'rainFall',
}

export interface FarmRecord {
  farmname: string;
  datetime?: Date;
  metricType: MetricType;
  metricValue: number;
}

export interface QueryParameters {
  month?: number;
  year?: number;
  limit?: number;
  offset?: number;
  page?: number;
  metricType?: MetricType;
  farmname?: string;
}

export type QueryParametersForValidation = {
  month?: unknown;
  year?: unknown;
  limit?: unknown;
  offset?: unknown;
  metricType?: unknown;
  page?: unknown;
  farmName?: unknown;
};
