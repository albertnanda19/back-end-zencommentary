const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "db_zencommentary",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.post("/submit-comment", async (req, res) => {
  try {
    const data = {
      comment: req.body.comment,
    };

    const responseFromFlask = await axios.post(
      "http://127.0.0.1:5000/predict",
      { comments: [data.comment] }
    );

    if (responseFromFlask.data && responseFromFlask.data.predictions) {
      const predictions = responseFromFlask.data.predictions;

      if (predictions.length > 0) {
        const sentimentPrediction = predictions[0];

        const connection = await pool.promise().getConnection();

        const [results, fields] = await connection.query(
          "INSERT INTO comments SET ?",
          { comment: data.comment, kategori: sentimentPrediction }
        );

        const [latestComment] = await connection.query(
          "SELECT * FROM comments ORDER BY id DESC LIMIT 1"
        );

        connection.release();

        res.status(200).json({
          message: "Data saved successfully",
          response: latestComment[0],
        });
      } else {
        console.error("Empty predictions from Flask:", predictions);
        res.status(500).json({ message: "Internal server error" });
      }
    } else {
      console.error(
        "Invalid or empty response from Flask:",
        responseFromFlask.data
      );
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
