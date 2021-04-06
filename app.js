
const express = require('express');
const app = express();
const client = require('./zooKeeperClient');
const ZooKeeper = require('zookeeper');

const port = 5001;



app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});