export enum MetricType {
  PH = 'pH',
  Temperature = 'temperature',
  Rainfall = 'rainFall',
}

export interface FarmRecord {
  farmname: string;
  datetime?: Date;
  metrictype: MetricType;
  value: number;
}

export interface QueryParameters {
  month?: number;
  year?: number;
  limit?: number;
  offset?: number;
  page?: number;
  metrictype?: MetricType;
  farmname?: string;
}

export type QueryParametersForValidation = {
  month?: unknown;
  year?: unknown;
  limit?: unknown;
  offset?: unknown;
  metrictype?: unknown;
  page?: unknown;
  farmName?: unknown;
};

export type UserInputForValidation = {
  username: unknown;
  password: unknown;
};
