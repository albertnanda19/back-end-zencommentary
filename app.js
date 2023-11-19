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

// Endpoint untuk mengirim data ke Flask dan mendapatkan data terakhir dari database
// Endpoint untuk mengirim data ke Flask dan mendapatkan data terakhir dari database
app.post("/submit-comment", async (req, res) => {
  try {
    const data = {
      comment: req.body.comment,
    };

    // Kirim data komentar ke backend Flask
    const responseFromFlask = await axios.post(
      "http://127.0.0.1:5000/predict",
      { comments: [data.comment] }
    );

    // Pemeriksaan apakah responseFromFlask.data dan responseFromFlask.data.predictions didefinisikan
    if (responseFromFlask.data && responseFromFlask.data.predictions) {
      const predictions = responseFromFlask.data.predictions;

      // Pemeriksaan apakah predictions memiliki elemen ke-0
      if (predictions.length > 0) {
        const sentimentPrediction = predictions[0];

        const connection = await pool.promise().getConnection();

        // Insert data into the database
        const [results, fields] = await connection.query(
          "INSERT INTO comments SET ?",
          { comment: data.comment, kategori: sentimentPrediction }
        );

        // Get the latest comment from the database
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
