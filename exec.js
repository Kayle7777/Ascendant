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
    if (!this.alreadyCompiled && (this.localFiles.some((localFileName) => localFileName.fileName === this.scrapedPost.fileName))) {
      return;
    }
    console.log(`writing ${this.scrapedPost.fileName}`);
    let toWrite = await format.buildHtmlPipe(this.scrapedPost.post, this.scrapedPost.fileName, this.alreadyCompiled);
    this.writeFile(this.scrapedPost, toWrite);
  }

  writeFile(scrapedPost, toWrite) {
    fs.writeFileSync(path.join(__dirname, 'pages-forum', scrapedPost.fileName), toWrite);
  }

  constructor(scrapedPost, alreadyCompiled = false) {
    this.localFiles = null; // [ { title: string, post: string } ]
    this.alreadyCompiled = alreadyCompiled; // Boolean; true if post is already formatted
    this.scrapedPost = null; 
    // type
    // title
    // time
    // fileName
    // post
    this.updateLocalFiles();
    this.scrapedPost = scrapedPost;
    this.init();
  }
}

function fixSidebarLinks() {
  // iterate over all files in 'pages-forum'
  let localFiles = scripts.files.getLocalFiles(),
      fileNames = localFiles.map(file => file.fileName);
  for (let i = 0; i < localFiles.length; i++) {
    let file = localFiles[i],
        $ = file.post.toCheerioObject(),
        fileName = file.fileName,
        changed = false;
    let prevButtonLink =     fileNames[fileNames.indexOf(fileName) - 1] || fileNames[fileNames.length - 1],
        nextButtonLink =     fileNames[fileNames.indexOf(fileName) + 1] || fileNames[0],
        filePrevButtonLink = $(".sidenav a").attr("href"),
        fileNextButtonLink = $(".sidenav-right a").attr("href");
    // console.log("file", file);
    // console.log("prevButtonLink", prevButtonLink);
    // console.log("nextButtonLink", nextButtonLink);
    // console.log("filePrevButtonLink", filePrevButtonLink);
    // console.log("fileNextButtonLink", fileNextButtonLink);
    if (prevButtonLink !== filePrevButtonLink) {
      console.log("prevButtonLink !== filePrevButtonLink");
      changed = true;
      $(".sidenav a").attr("href", prevButtonLink);
    }
    if (nextButtonLink !== fileNextButtonLink) {
      console.log("nextButtonLink !== fileNextButtonLink");
      changed = true;
      $(".sidenav-right a").attr("href", nextButtonLink);
    }
    if (changed) {
      console.log("Fixing link for", fileName);
      file.post = $.html()
      new GetPost(file, true);
      return;
    }
  }
}

fetch.getJayfictionPosts((posts) => {
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    new GetPost(post);
  }
  fixSidebarLinks();
});
