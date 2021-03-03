'use strict';
const path = require('path'),
  fs = require('fs'),
  cheerio = require('cheerio');

Object.defineProperty(String.prototype, 'toCheerioObject', {
  value: function () {
    return cheerio.load(this);
  },
});

const scripts = require('./scripts.js'),
  format = require('./format.js'),
  fetch = require('./fetch.js');

class GetPost {
  updateLocalFiles() {
    this.localFiles = scripts.files.getLocalFiles();
  }
  async init() {
    if (this.localFiles.some((localFileName) => localFileName.fileName === this.scrapedPost.fileName)) {
      return;
    }
    console.log(`writing ${this.scrapedPost.fileName}`);
    let toWrite = await format.buildHtmlPipe(this.scrapedPost.post, this.scrapedPost.fileName);
    this.writeFile(this.scrapedPost, toWrite);
  }

  writeFile(scrapedPost, toWrite) {
    fs.writeFileSync(path.join(__dirname, 'pages-forum', scrapedPost.fileName), toWrite);
  }

  constructor(scrapedPost) {
    this.localFiles = null; // [ { title: string, post: string } ]
    this.scrapedPost = null; // type
    // title
    // time
    // fileName
    // post
    this.isDuplicate = null; // Boolean; true if post is present on disk already
    this.updateLocalFiles();
    this.scrapedPost = scrapedPost;
    this.init();
  }
}

fetch.getJayfictionPosts((posts) => {
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    new GetPost(post);
  }
});
