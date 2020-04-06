'use strict';

Object.defineProperty( String.prototype, 'toCheerioObject', {
    value: function() {
        return cheerio.load(this);
    },
});

const fs          = require('fs'),
      path        = require('path'),
      fetch       = require('node-fetch'),
      fetchScripts= require('./fetch.js'),
      formatting  = require('./format.js');
const exports = {
    getLocalFilenames: (editedFolder = false) => {
        let _folder = __dirname + (editedFolder ? '/pages-forum/' : '/pages-edited/');
        return fs.readdirSync(_folder)
                 .filter(name => !/\.js$|\.css$/.test(name))
    },
    
    getLocalFiles: function(editedFolder = false) {
        let _folder = __dirname + (editedFolder ? '/pages-forum/' : '/pages-edited/');
        return this.getLocalFilenames(editedFolder).reduce((accu, fileName, i) => {
            i = i.toString();
            const fullPath = path.join(_folder, fileName);
            accu[i] = {
                title: fileName,
                content: fs.readFileSync(fullPath, { encoding: 'utf-8' })
            }
            return accu;    
        }, {})
    },
}

module.exports = exports;

function downloadPictures() {
    let localFiles = exports.getLocalFiles();
    
}
downloadPictures();