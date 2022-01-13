/// <reference types="express" />

declare namespace Express {
  export interface Request {
    where?: QueryParameters;
    options?: QueryParameters;
    datetime?: Record<sequelize>;
  }
}
