const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test database connection
pool.connect((err) => {
  if (err) {
    console.error("Database connection error:", err.stack);
  } else {
    console.log("Connected to PostgreSQL");
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

// Basic route to fetch data
app.get("/projects", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projeto.projeto");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err.stack);
    res.status(500).send("Error fetching users");
  }
});

app.put("/project/status", async (req, res) => {
  console.log("body", req.body);
  const { id_projeto, status } = req.body;

  if (!id_projeto || !status) {
    return res.status(400).json({ message: "Missing id_projeto or status" });
  }

  try {
    const result = await pool.query(
      "UPDATE projeto.projeto SET status = $1 WHERE id_projeto = $2 RETURNING *",
      [status, id_projeto]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      message: "Status updated successfully",
      project: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating project status:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Export the app for Vercel
module.exports = app;
