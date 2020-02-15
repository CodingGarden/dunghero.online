const path = require('path');
const express = require('express');
const http = require('http');

const sockets = require('./sockets');

const app = express();
const server = http.createServer(app);
sockets(server);

const staticPath = path.join(__dirname, '..', 'public');
app.use(express.static(staticPath));

const port = process.env.PORT || 9090;
server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
