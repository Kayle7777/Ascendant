const fs      = require('fs'),
      path    = require('path'),
      cheerio = require('cheerio'),
      folder  = path.join(__dirname, '/pages-forum');
fs.readdir(folder, (__err, data) => {
    for (let filename of data) {
        let dir  = path.join(__dirname, '/pages-forum/', filename);
        let $    = cheerio.load(fs.readFileSync(dir)),
            body = $('*');
        body.prepend('<div style="color:white; background:darkgray;">');
        body.append('</div>');
        fs.writeFileSync(dir, body.html());
    }
});