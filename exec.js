'use strict';
const path = require('path'),
  fs = require('fs'),
  cheerio = require('cheerio');

const { pipe } = require('./format.js');

Object.defineProperty(String.prototype, 'toCheerioObject', {
  value: function () {
    return cheerio.load(this);
  },
});

const scripts = require('./scripts.js'),
  format = require('./format.js'),
  fetch = require('./fetch.js');

// init, find what story pieces we already have

class GetPost {
  updateLocalFiles() {
    // console.log(scripts.files.getLocalFiles());
    this.localFiles = scripts.files.getLocalFiles();
  }
  async init() {
    // Check post name against fileName;
    // if (this.localFiles.some((lf) => lf.title.replace(/^\w+(?<=_)/, '') === this.scrapedPost.title)) {
    //   return; // don't need to do anything
    // }
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
    // gets the post and writes it
    const post = posts[i];
    new GetPost(post);
    // if (i > 2) {
    //     // console.log(posts[i]);
    //     break;
    // }
  }
  // iterate it again to do the sidebar links
  for (let i = 0; i < posts.length; i++) {
    // const post = posts[i];
    // fs.writeFileSync(path.join(__dirname, 'pages-forum', post.fileName), format.addSidebarButtons(post.fileName)(post.post));
  }
});
