const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.post('/api/saveData', (req, res) => {
  try {
    const data = req.body;

    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting MySQL connection:', err);
        res.status(500).json({ message: 'Internal server error' });
        return;
      }

      connection.query('INSERT INTO your_table SET ?', data, (error, results) => {
        connection.release();

        if (error) {
          console.error('Error inserting data into MySQL:', error);
          res.status(500).json({ message: 'Internal server error' });
          return;
        }

        res.status(200).json({ message: 'Data saved successfully' });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
