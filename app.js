const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.port || 3000;

app.use(bodyParser.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_zencommentary",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.post("/send-data", async (req, res) => {
  try {
    const data = {
      // id: req.body.id,
      comment: req.body.comment,
    };

    const connection = await pool.promise().getConnection();

    // Insert data into the database
    const [results, fields] = await connection.query(
      "INSERT INTO comments SET ?",
      data
    );

    // Get the inserted data
    const [insertedData] = await connection.query(
      "SELECT * FROM comments WHERE id = ?",
      results.insertId
    );

    connection.release();

    res.status(200).json({
      message: "Data saved successfully",
      insertedData: insertedData[0],
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/get-data", async (req, res) => {
  try {
    const connection = await pool.promise().getConnection();

    const [dataRows] = await connection.query("SELECT * FROM comments");

    connection.release();

    res.status(200).json({
      message: "Data received successfully",
      data: dataRows,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
