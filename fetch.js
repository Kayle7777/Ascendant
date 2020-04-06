'use strict';

const fetch = require('node-fetch'),
    formatting = require('./format'),
    baseUrls = [
        { url: 'https://forums.spacebattles.com/threads/imperium-ascendant-heresy-less-40k.596194/reader/', pages: 6 },
        {
            url: 'https://forums.spacebattles.com/threads/imperium-ascendant-heresy-less-40k.596194/16/reader/',
            pages: 3,
        },
        {
            url: 'https://forums.spacebattles.com/threads/imperium-ascendant-heresy-less-40k.596194/13/reader/',
            pages: 2,
        },
        {
            url: 'https://forums.spacebattles.com/threads/imperium-ascendant-heresy-less-40k.596194/19/reader/',
            pages: 3,
        },
    ];

const masterPageList = (() => {
    let arr = [
        ...baseUrls.map((obj) => obj.url),
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
})();

module.exports = {
    getJayfictionPosts: function (callbackFn) {
        Promise.all(masterPageList.map((pageUrl) => fetch(pageUrl)))
        .then(
            (fetchPages) => {
                Promise.all(fetchPages.map((bufferPageObject) => bufferPageObject.text()))
                    .then(
                        (pages) => {
                            const jayFictionPosts = [];
                            for (let page of pages) {
                                jayFictionPosts.push(...formatting.scrapeForJayfictionPosts(page));
                            }
                            callbackFn(jayFictionPosts);
                        },
                        (reject) => console.log(reject)
                    )
                    .catch((err) => console.log(err));
            },
            (reject) => console.log(reject))
        .catch((err) => console.log(err));
    },
};
