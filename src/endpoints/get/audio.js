
const fs = require("fs");
const pool = require("../../utilities/mysql.js").pool;

const area = (app) => {
  app.get("/api/audio", function(req, res) {
    const file = req.query.file;
    console.log(file)
    const path = `/Users/sepezho/Work/blog/Blog/telegram1/${file}`
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1]
        ? parseInt(parts[1], 10)
        : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(path, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mp3',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
    }
  });
};

module.exports = area;
