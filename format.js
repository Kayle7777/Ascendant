const fs      = require('fs'),
      path    = require('path'),
      folder  = path.join(__dirname, '/pages-edited');
fs.readdir(folder, (__err, filenames) => {
    for (let filename of filenames) {
        let absoluteFilePath = path.join(folder, filename),
            fileText = fs.readFileSync(absoluteFilePath, { encoding: 'utf-8' })
                         .replace(
                             'style> <br>',
                             '> <br>'
                         )
                         .replace(
                             '<div style="color:white;background:#0000DF;padding: 2.5em;font-size: 2em;font-family: monospace;">',
                             '<link rel="stylesheet" href="asc.css"><div class="storytext">'
                         ); 

        fs.writeFile(absoluteFilePath, fileText, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    }
});
