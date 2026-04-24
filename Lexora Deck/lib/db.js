import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

let pool

export async function getConnection() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

export async function query(sql, params) {
  const connection = await getConnection()
  const [results] = await connection.execute(sql, params)
  return results
}

// Initialize database tables
export async function initDatabase() {
  try {
    const connection = await getConnection()

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Create user_progress table for tracking flashcard progress
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        card_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        times_viewed INT DEFAULT 0,
        last_viewed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_card (user_id, card_name)
      )
    `)

    // Create quiz_results table for tracking quiz completions
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        score INT NOT NULL,
        total_questions INT NOT NULL,
        percentage DECIMAL(5,2) NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    console.log("Database tables initialized successfully")
  } catch (error) {
    console.error("Database initialization error:", error)
  }
}
