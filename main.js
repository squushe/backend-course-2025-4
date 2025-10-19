const { program } = require("commander");
const fs = require("fs");
const http = require("http");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");

program
  .requiredOption("-i, --input <path>")
  .requiredOption("-H, --host <host>")
  .requiredOption("-p, --port <port>");

program.parse();

const options = program.opts();

if (!fs.existsSync(options.input)) {
  console.error("Cannot find input file");
  process.exit(1);
}

fs.readFile(options.input, "utf-8", (err, data) => {
  if (err) throw err;
  fs.writeFile("output.txt", data, (err) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });
});

let server = http.createServer((req, res) => {
  fs.readFile(options.input, "utf-8", (err, data) => {
    if (err) throw err;
    const parsed = JSON.parse(data);
    let workdata = parsed;

    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const params = urlObj.searchParams;

    if (params.get("survived") === "true") {
      workdata = workdata.filter((passanger) => passanger.Survived == "1");
    }

    const xmlData = workdata.map((passenger) => {
      const obj = {
        Name: passenger.Name,
        Ticket: passenger.Ticket,
      };

      if (params.get("age") === "true") obj.Age = passenger.Age;
      return obj;
    });
    const builder = new XMLBuilder({ ignoreAttributes: false, format: true });
    const xmlContent = builder.build({ Passengers: { Passenger: xmlData } });
    res.writeHead(200, { "Content-Type": "application/xml" });
    res.end(xmlContent);
  });
});
server.listen(options.port, options.host, () => {});
//npx nodemon main.js -- -i titanic.json -H 127.0.0.1 -p 3000
