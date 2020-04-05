'use strict';

Object.defineProperty( String.prototype, 'toCheerioObject', {
    value: function() {
        return cheerio.load(this);
    },
});

const fs       = require('fs'),
      path     = require('path'),
      fetch    = require('node-fetch'),
      cheerio  = require('cheerio'),
      formatting = require('./format'),
      baseUrls = [
    { url: 'https://forums.spacebattles.com/threads/imperium-ascendant-heresy-less-40k.596194/reader/', pages: 6 },
    { url: 'https://forums.spacebattles.com/threads/imperium-ascendant-heresy-less-40k.596194/16/reader/', pages: 3 },
    { url: 'https://forums.spacebattles.com/threads/imperium-ascendant-heresy-less-40k.596194/13/reader/', pages: 2 },
    { url: 'https://forums.spacebattles.com/threads/imperium-ascendant-heresy-less-40k.596194/19/reader/', pages: 3 },
      ],
     pagesForum = '/pages-forum/',
     pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

function buildPost(post, filePath) {
    return pipe(
            formatting.removeStyle,
            formatting.addStorytextDiv,
            formatting.addLocalCss,
            formatting.addJQueryCDN,
            formatting.addLocalJs,
            formatting.addSidebarButtons(filePath),
        )
    (post);
}

let pages = (() => {
    let arr = [
        ...baseUrls.map(obj => obj.url),
        ...baseUrls.reduce((accu, obj) => {
            accu = [
                ...accu,
                ...(() => {
                    let _arr = [];
                    for (let i = 0; i < obj.pages; i++) {
                        _arr.push(obj.url + 'page-' + (i + 1));
                    }
                    return _arr;
                })(),
            ];
            return accu;
        }, []),
    ];
    return arr;
})().map(page => fetch(page));

Promise.all(pages).then(
    fetchPages => {
        Promise.all(fetchPages.map(bufferPageObject => bufferPageObject.text()))
            .then(
                pages => {
                    for (let page of pages) {
                        const $ = cheerio.load(page);
                        $('article.hasThreadmark[data-author="Jayfiction"]').each(function() {
                            let type = $('.message-cell--threadmark-header label', this)
                                    .text()
                                    .replace(/[\\\/:]/g, '-')
                                    .replace(/"/g, ''),
                                title = $('.message-cell--threadmark-header span', this)
                                    .text()
                                    .replace(/[\\\/:]/g, '-')
                                    .replace(/"/g, '')
                                    .replace(/\.?New$/, ''),
                                time = new Date($('time', this).attr('datetime')),
                                fileName = `${pagesForum}${time.getTime()}--${type}_${title}.html`,
                                filePath = path.join(__dirname, fileName),
                                post = $('div.bbWrapper', this).html(),
                                builtPost = buildPost(post, filePath);
                            if (fs.existsSync(filePath) /* || forceRewrite */) {
                                return;
                            };
                            fs.writeFileSync(
                                filePath,
                                builtPost
                            );   
                        });
                    }
                },
                reject => console.log(reject)
            )
            .catch(err => console.log(err));
    },
    reject => console.log(reject).catch(err => console.log(err))
);

