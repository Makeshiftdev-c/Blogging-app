const dotenv = require("dotenv");
const mongodb = require("mongodb");

dotenv.config();

mongodb.connect(
  process.env.CONNECTIONSTRING,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    module.exports = client;
    const server = require("./server");
    server.listen(process.env.PORT);
  }
);
