import { Database, getRouter } from '.';

import serverless from 'serverless-http';

export * from './tools';
export * from './routes';
export * from './middlewares';
export * from './controllers';

Database.initPrisma();
const options = { basePath: '/v1/platform' };
export const handler = serverless(getRouter(), options);
