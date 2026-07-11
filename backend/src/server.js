require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`[server] Loka API listening on port ${PORT} (${process.env.NODE_ENV})`);
  });
};

start();

// Surface unhandled promise rejections instead of failing silently.
process.on('unhandledRejection', (err) => {
  console.error(`[server] Unhandled rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
