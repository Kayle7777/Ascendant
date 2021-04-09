'use strict';
const fs = require('fs'),
  path = require('path'),
  scripts = require('./scripts.js');

module.exports = {
  pipe: (...fns) => (x) => fns.reduce((v, f) => f(v), x),
  buildHtmlPipe: (post, fileName, alreadyCompiled) => {
    if (alreadyCompiled) {
      return post;
    }
    return module.exports.pipe(
      module.exports.removeStyle,
      module.exports.addStorytextDiv,
      module.exports.addLocalCss,
      module.exports.addJQueryCDN,
      module.exports.addLocalJs,
      module.exports.addSidebarButtons(fileName)
    )(post);
  },

  removeStyle: function (fileText) {
    return fileText.replace('style="font-size: 0.750rem"', '');
  },

  addStorytextDiv: function (fileText) {
    return '<html><head></head><body><div class="storytext">' + fileText + '</div></body></html>';
  },

  addLocalCss: function (fileText) {
    return fileText.replace('</head>', '<link rel="stylesheet" href="asc.css"></head>');
  },

  addJQueryCDN: function (fileText) {
    return fileText.replace(
      '</head>',
      '<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script></head>'
    );
  },

  addLocalJs: function (fileText) {
    return fileText.replace('</head>', '<script type="text/javascript" src="asc.js"></script></head>');
  },

  addSidebarButtons: (fileName) => {
    // Get absolute path
    //   .map(name => path.join(__dirname, 'pages-forum', name));
    return (fileText) => {
        let $ = fileText.toCheerioObject(),
          filenames = scripts.files.getLocalFilenames(),
          prevButtonLink = filenames[filenames.indexOf(fileName) - 1] || filenames[filenames.length - 1],
          nextButtonLink = filenames[filenames.indexOf(fileName) + 1] || filenames[0];
        $('.storytext').prepend(
          $(`<div class="sidenav"><a type='button' rel='noopener noreferrer' href="${prevButtonLink}"></a></div>`)
        );
        $('.storytext').append(
          $(`<div class="sidenav-right"><a type='button' rel='noopener noreferrer' href="${nextButtonLink}"></a></div>`)
        );
        return $.html();
    };
  },

  scrapePageForJayfictionPosts: function (page) {
    const $ = page.toCheerioObject();
    const articles = [];
    $('article.hasThreadmark[data-author="Jayfiction"]').each(function () {
      let time = new Date($('time', this).attr('datetime')),
        type = $('.message-cell--threadmark-header label', this)
          .text()
          .replace(/[\\\/:]/g, '-')
          .replace(/"/g, ''),
        title = $('.message-cell--threadmark-header span', this)
          .text()
          .replace(/[\\\/:]/g, '-')
          .replace(/"/g, '')
          .replace(/New$/, '');
      return articles.push({
        type: type,
        title: title,
        time: time,
        fileName: `${time.getTime()}--${type}_${title}.html`,
        post: $('div.bbWrapper', this).html(),
      });
    });
    return articles;
  },
};
