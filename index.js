const http = require("http");
const fs = require("fs");
const querystring = require("querystring");

const PORT = 2000;
console.log(`Server is listen on port ${PORT}`, `http://localhost:${PORT}`);

const server = (req, res) => {
  if (req.method === "GET") {
    const directory = querystring.parse(req.url).directory;
    const title = querystring.parse(req.url)["/?title"];

    if (!title || !directory) {
      console.error("Title or Directory not provided in query string");
      return;
    }

    res.setHeader("Content-Type", "text/html");
    res.statusCode = 200;

    fs.readdir(`directories/${directory}`, function (err, files) {
      if (err) {
        res.end(`No such directory ${directory}`);
        console.error(err);
        return;
      }
      const file = files.find((file) => file === `${title}.txt`);
      if (file) {
        // I am stuck here
        console.log("File here");
      }
    });

    res.end("File not found");
  }
  if (req.method === "POST" && req.url === "/") {
    res.statusCode = 201;
    res.setHeader("Content-Type", "text/html");

    req.on("data", (chunk) => {
      const body = chunk.toString();

      const { note, directory, title } = JSON.parse(body);

      if (!note || !directory || !title) {
        console.error("required items not provided");
        return;
      }

      if (!fs.existsSync(`directories`)) {
        fs.mkdirSync(`directories`);
      }
      if (!fs.existsSync(`directories/${directory}`)) {
        fs.mkdirSync(`directories/${directory}`);
      }

      fs.writeFile(`directories/${directory}/${title}.txt`, note, () => {
        res.end(`Note saved to directory ${directory}`);
      });
    });
  } else {
    res.end("404, Route not found");
  }
};

http.createServer(server).listen(PORT);
