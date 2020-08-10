const http = require("http");
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");

const PORT = 2000;
console.log(`Server is listen on port ${PORT}`, `http://localhost:${PORT}`);

const server = (req, res) => {
  console.log(req.url)
  if (req.method === "GET" && req.url === "/") {
    res.setHeader("Content-Type", "text/html");
    res.statusCode = 200;
    res.end("Welcome to the notes API");
  }
  if (req.method === "GET" && url.parse(req.url).pathname === "/search") {
    const directory = querystring.parse(req.url).directory;
    const title = querystring.parse(req.url)["/search?title"];

    if (!title || !directory) {
      console.error("Title or Directory not provided in query string");
      return;
    }

    res.setHeader("Content-Type", "text/html");
    res.statusCode = 200;

    return new Promise((resolve, reject) => {
      fs.readdir(`directories/${directory}`, function (err, files) {
        if (err) {
          reject(res.end(`No such directory ${directory}`));
          console.error(err);
          return;
        }
        const file = files.find((file) => file === `${title}.txt`);
        if (file) {
          fs.readFile(
            `directories/${directory}/${file}`,
            "utf8",
            (err, contents) => {
              if (err) reject(err);
              resolve(res.end(contents));
            }
          );
        } else {
          res.end("file not found");
        }
      });
    });
  }
  if (req.method === "POST" && req.url === "/") {
    res.statusCode = 201;
    res.setHeader("Content-Type", "text/html");

    req.on("data", (chunk) => {
      const body = chunk.toString();

      const { content, directory, title } = JSON.parse(body);

      if (!content || !directory || !title) {
        console.error("required items not provided");
        return;
      }

      if (!fs.existsSync(`directories`)) {
        fs.mkdirSync(`directories`);
      }
      if (!fs.existsSync(`directories/${directory}`)) {
        fs.mkdirSync(`directories/${directory}`);
      }

      fs.writeFile(`directories/${directory}/${title}.txt`, content, () => {
        res.end(`Note saved to directory ${directory}`);
      });
    });
  }

  if (req.method === "GET" && req.url === "/summary") {
    return new Promise((resolve, reject) => {
      fs.readdir(`directories`, (err, dirs) => {
        const summary = {};

        dirs.forEach((dir) => {
          const files = fs.readdirSync(`directories/${dir}`);
          summary[dir] = files;
        });

        resolve(res.end(JSON.stringify(summary)));
      });
    });
  }

  if (req.method === "PATCH" && url.parse(req.url).pathname === "/") {
    res.statusCode = 201;
    res.setHeader("Content-Type", "text/html");

    req.on("data", (chunk) => {
      const body = chunk.toString();

      const {
        currentTitle,
        newTitle,
        currentContent,
        newContent,
        directory,
      } = JSON.parse(body);

      if (!currentTitle || !directory) {
        console.error("current title or directory not provided");
        res.end("current title or directory not provided");
      }

      return new Promise((resolve, reject) => {
        fs.readdir(`directories/${directory}`, function (err, files) {
          if (err) {
            reject(res.end(`No such directory ${directory}`));
            console.error(err);
            return;
          }
          const file = files.find((file) => file === `${currentTitle}.txt`);
          if (file) {
            const titleToUse = newTitle ? newTitle : currentTitle;
            const contentToUse = newContent
              ? newContent
              : fs.readFileSync(`directories/${directory}/${file}`, "utf8");

            fs.renameSync(
              `directories/${directory}/${currentTitle}.txt`,
              `directories/${directory}/${titleToUse}.txt`
            );

            fs.writeFile(
              `directories/${directory}/${titleToUse}.txt`,
              contentToUse,
              () => {
                res.end(
                  `{message: Note successfully updated, data: ${contentToUse}}`
                );
              }
            );
          } else {
            res.end("file not found");
          }
        });
      }).catch((err) => res.end(err));
    });
  }

  if (req.method === "DELETE" && url.parse(req.url).pathname === "/") {
    const directory = querystring.parse(req.url).directory;
    const title = querystring.parse(req.url)["/?title"];
    if (!title || !directory) {
      console.error("Title or Directory not provided in query string");
      return;
    }

    res.setHeader("Content-Type", "text/html");
    res.statusCode = 200;

    return new Promise((resolve, reject) => {
      fs.readdir(`directories/${directory}`, function (err, files) {
        if (err) {
          reject(res.end(`No such directory ${directory}`));
          console.error(err);
          return;
        }
        const file = files.find((file) => file === `${title}.txt`);
        if (file) {
          fs.unlink(`directories/${directory}/${file}`, () => {
            if (files.length === 1) fs.rmdirSync(`directories/${directory}`);
            res.end("File successfully deleted");
          });
        } else {
          res.end("file not found");
        }
      });
    });
  } else {
    res.end("404, Route not found");
  }
};

http.createServer(server).listen(PORT);
