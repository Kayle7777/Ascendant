const fs       = require('fs'),
      path     = require('path'),
      fetch    = require('node-fetch'),
      cheerio  = require('cheerio'),
      baseUrls = [
    { url: 'https://forums.spacebattles.com/threads/imperium-ascendant-heresy-less-40k.596194/reader/', pages: 6 },
    { url: 'https://forums.spacebattles.com/threads/imperium-ascendant-heresy-less-40k.596194/16/reader/', pages: 3 },
    { url: 'https://forums.spacebattles.com/threads/imperium-ascendant-heresy-less-40k.596194/13/reader/', pages: 2 },
    { url: 'https://forums.spacebattles.com/threads/imperium-ascendant-heresy-less-40k.596194/19/reader/', pages: 3 },
];
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
                                    .replace(/"/g, ''),
                                time = new Date($('time', this).attr('datetime')),
                                post = $('div.bbWrapper', this).html();
                            // console.log(path.join(__dirname, `/pages-forum/${type}_${title}_${time}.html`))
                            fs.writeFileSync(
                                path.join(__dirname, `/pages-edited/${time.getTime()}--${type}_${title}.html`),
                                '<div style="color:white;background:#0000DF;padding: 2.5em;font-size: 2em;font-family: monospace;">' + post + '</div>'
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
