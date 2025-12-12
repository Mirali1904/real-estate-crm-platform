// lib/db.ts
import mysql from "mysql2/promise";

/**
 * If environment variables are not set, these default values are used.
 * Change defaults if your local MySQL uses a different user/password/database.
 */
const DB_HOST = process.env.MYSQL_HOST || "127.0.0.1";
const DB_USER = process.env.MYSQL_USER || "root";
const DB_PASSWORD = process.env.MYSQL_PASSWORD || ""; // often empty for local XAMPP
const DB_NAME = process.env.MYSQL_DATABASE || "realestate_crm";
const DB_PORT = Number(process.env.MYSQL_PORT || 3306);

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const conn = pool;
export default pool;
