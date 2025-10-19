const { program } = require("commander");
const fs = require("fs");
const http = require("http");

program
  .requiredOption("-i,--input <path>")
  .requiredOption("-h, --host ")
  .requiredOption("-p,--port");

program.parse();

const options = program.opts();

if (!fs.existsSync(options.input)) {
  console.error("Cannot find input file");
  process.exit(1);
}
let server = http.createServer();
server.listen(options.port, options.host);
