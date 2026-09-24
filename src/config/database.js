//funcion "dotenv" y "promise" son para interactuar con la bd
import dotenv from 'dotenv'; 
import mysql from 'mysql2/promise';

dotenv.config();

/**
 * Pool de conexiones reutilizables hacia la base de datos MySQL.
 * Se configura a partir de las variables de entorno para evitar
 * credenciales expuestas en el código fuente
 * @type {import('mysql2/promise').Pool}
 */
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verifica la disponibilidad de la conexión de la bd 

export async function checkDatabaseConnection() {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
}