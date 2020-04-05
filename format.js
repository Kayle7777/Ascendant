'use strict';
const fs      = require('fs'),
      path    = require('path'),
      folder  = path.join(__dirname, '/pages-forum');

const callbacks = {
    addSidebarButtons: function(filePath) {
        // make filenames absolute path
        const filenames = fs.readdirSync(folder)
                .filter(name => !/\.js$|\.css$/.test(name))
                .map(name => path.join(folder, name));
        return fileText => {
            let prevButtonLink = filenames[filenames.indexOf(filePath) - 1] || filenames[filenames.length - 1],
                nextButtonLink = filenames[filenames.indexOf(filePath) + 1] || filenames[0],
                $ = fileText.toCheerioObject();
            $('.storytext').prepend($(`<div class="sidenav"><a type='button' rel='noopener noreferrer' href="${prevButtonLink}"></a></div>`));
            $('.storytext').append($(`<div class="sidenav-right"><a type='button' rel='noopener noreferrer' href="${nextButtonLink}"></a></div>`));
            return $.html()
        };
    },
    
    addStorytextDiv: function(fileText) {
        return '<html><head></head><body><div class="storytext">' + fileText + '</div></body></html>';
    },

    removeStyle: function(fileText) {
        return fileText.replace('style="font-size: 0.750rem"', '')
    },

    addJQueryCDN: function(fileText) {
        return fileText.replace(
            '</head>',
            '<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script></head>'
        );
    },

    addLocalJs: function(fileText) {
        return fileText.replace(
            '</head>',
            '<script type="text/javascript" src="asc.js"></script></head>'
        );
    },

    addLocalCss: function(fileText) {
        return fileText.replace(
            '</head>',
            '<link rel="stylesheet" href="asc.css"></head>'
        );
    }
}

module.exports = {
    ...callbacks    
}
