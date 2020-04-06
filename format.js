'use strict';
const fs      = require('fs'),
      path    = require('path'),
      scripts = require('scripts.js'),
      pipe    = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

module.exports = {    
    buildHtmlPipe: (post, fileName) => {
        return pipe(
                this.removeStyle,
                this.addStorytextDiv,
                this.addLocalCss,
                this.addJQueryCDN,
                this.addLocalJs,
                this.addSidebarButtons(fileName),
            )(post);
    },

    removeStyle: function(fileText) {
        return fileText.replace('style="font-size: 0.750rem"', '')
    },

    addStorytextDiv: function(fileText) {
        return '<html><head></head><body><div class="storytext">' + fileText + '</div></body></html>';
    },
    
    addLocalCss: function(fileText) {
        return fileText.replace(
            '</head>',
            '<link rel="stylesheet" href="asc.css"></head>'
        );
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

    addSidebarButtons: (fileName, editFolder = false) => {
        // Get absolute path
        const filenames = scripts.getLocalFilenames()
                          .map(name => path.join(__dirname, editFolder ? 'pages-edited' : 'pages-forum', name));
        
        return fileText => {
            let              $ = fileText.toCheerioObject(),
                prevButtonLink = filenames[filenames.indexOf(fileName) - 1] || filenames[filenames.length - 1],
                nextButtonLink = filenames[filenames.indexOf(fileName) + 1] || filenames[0];

            $('.storytext').prepend($(`<div class="sidenav"><a type='button' rel='noopener noreferrer' href="${prevButtonLink}"></a></div>`));
            $('.storytext').append($(`<div class="sidenav-right"><a type='button' rel='noopener noreferrer' href="${nextButtonLink}"></a></div>`));
            return $.html();
        };
    },

    scrapePageForJayfictionPosts: function(page) {
        page = page.toCheerioObject();
        const articles = [];
        page('article.hasThreadmark[data-author="Jayfiction"]').each(function() {
            return articles.push({
                type: page('.message-cell--threadmark-header label', this)
                        .text()
                        .replace(/[\\\/:]/g, '-')
                        .replace(/"/g, ''),
                title: page('.message-cell--threadmark-header span', this)
                        .text()
                        .replace(/[\\\/:]/g, '-')
                        .replace(/"/g, '')
                        .replace(/New$/, ''),
                time: new Date(page('time', this).attr('datetime')),
                fileName: `${time.getTime()}--${type}_${title}.html`,
                post: page('div.bbWrapper', this).html()
            });
        });
        return articles;
    },
}