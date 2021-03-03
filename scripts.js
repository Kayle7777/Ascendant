const fs          = require('fs'),
      path        = require('path'),
      fetch       = require('node-fetch'); // for images

module.exports = {
    files: {
        getLocalFilenames: () => {
            let _folder = __dirname + '/pages-forum/';
            return fs.readdirSync(_folder)
                    .filter(name => !/\.js$|\.css$/.test(name))
        },
        
        getLocalFiles: function() {
            let _folder = __dirname + '/pages-forum/';
            return this.getLocalFilenames().reduce((accu, fileName) => {
                const fullPath = path.join(_folder, fileName);
                accu.push({
                    time: fileName.replace(/(?!\d+).*/, ''),
                    title: fileName.replace(/^\d+--(.+)\.html$/, '$1'),
                    fileName: fileName,
                    post: fs.readFileSync(fullPath, { encoding: 'utf-8' })
                });
                return accu;    
            }, [])
        }
    },

    images: {
        getImageUrls: function(fileText) {    
            var $ = fileText.toCheerioObject();
            return $('img').map((i, e) => $(e).attr('href').text());
        },

        getImageStream: function(imageUrl) {
            return fetch(imageUrl);
        },
    }
};