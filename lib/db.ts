// lib/db.ts
import mysql from "mysql2/promise";

export const conn = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // put your password if you have one
  database: "realestate_crm",
});
