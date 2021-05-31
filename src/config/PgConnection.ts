import { Pool } from 'pg';
const CONNECTION_STRING = process.env.PG_CONNECTION_STRING;

export default new Pool ({
    max: 20,
    connectionString: `${CONNECTION_STRING}`,
    idleTimeoutMillis: 1000
});