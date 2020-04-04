const fs      = require('fs'),
      path    = require('path'),
      cheerio = require('cheerio'),
      folder  = path.join(__dirname, '/pages-edited');

function formatFiles(callback) {
    fs.readdir(folder, (__err, filenames) => {
        filenames = filenames.filter(name => !/\.js$|\.css$/.test(name));
        for (let filename of filenames) {
            let absoluteFilePath = path.join(folder, filename),
                fileText = fs.readFileSync(absoluteFilePath, { encoding: 'utf-8' });
            fs.writeFile(absoluteFilePath, callback(absoluteFilePath, fileText, filenames), 'utf8', function (err) {
                if (err) return console.log(err);
            });
        }
    });
};

const callbacks = {
    cheerioMakeButtons: function(absoluteFilePath, fileText, filenames) {
        // make filenames absolute path
        filenames = filenames.map(name => path.join(folder, name));
        let prevButtonLink = filenames[filenames.indexOf(absoluteFilePath) - 1] || filenames[filenames.length - 1],
            nextButtonLink = filenames[filenames.indexOf(absoluteFilePath) + 1] || filenames[0];
        $ = cheerio.load(fileText);
        $('.storytext').prepend($(`<div class="sidenav"><a type='button' rel='noopener noreferrer' href="${prevButtonLink}"><</a></div>`));
        $('.storytext').append($(`<div class="sidenav-right"><a type='button' rel='noopener noreferrer' href="${nextButtonLink}">></a></div>`));
        return $.html();
    },
    addAscJs: function(__absoluteFilePath, fileText) {
        return fileText.replace(
            '<script type="text/javascript" href="asc.js"></script><link rel="stylesheet" href="asc.css">',
            '<script type="text/javascript" src="asc.js"></script><link rel="stylesheet" href="asc.css">'
            );
    },
    
    removeStyle: function(__absoluteFilePath, fileText) {
        return fileText.replace('style="font-size: 0.750rem"', '')
    },

    addJQueryCDN: function(__absoluteFilePath, fileText) {
        return fileText.replace(
            '<script type="text/javascript" src="asc.js">',
            '<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script><script type="text/javascript" src="asc.js">'
        );
    }
}



formatFiles(callbacks.addJQueryCDN);

