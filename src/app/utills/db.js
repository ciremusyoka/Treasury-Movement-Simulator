
import { Pool } from 'pg';

// Configuration for the PostgreSQL connection pool

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10), 
 
});

// Log connection errors 
pool.on('error', (err, ) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); 
});

export default pool; 