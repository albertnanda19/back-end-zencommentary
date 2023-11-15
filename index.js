const express = require("express");
const app = express();
const port = 3000;

app.get("/send", (req, res) => {
  res.send("kiwim");
});

app.get("/receive", (req, res) => {
  res.send("tewima");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
