const { createServer } = require('http');
const axios = require('axios');
const nextEnv = require('@next/env');
nextEnv.loadEnvConfig(process.cwd());

const server = createServer((req, res) => {
  res.end('ok');
});
server.listen(3001, () => {
  console.log('Test server ready');
});
