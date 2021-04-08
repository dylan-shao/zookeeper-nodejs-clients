
const express = require('express');
const app = express();
require('./zkClient');

const port = process.env.PORT;



app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});