const log4js = require('log4js');
const rjIdRegexParse = require('./rjIdRegexParse');
const fs = require('fs');
const path = require('path');
let downloadTrackListArray = [];

module.exports = function optimizeTrackDb (apiWorkInfoObj) {
  return recursiveFuncWorker(apiWorkInfoObj.tracks);
}

function recursiveFuncWorker(jsonData, pathString = '') {
  let downloadTrackListArray = [];
  for (let i = 0; i < jsonData.length; i++) {
    if (jsonData[i].type === 'folder') {
      downloadTrackListArray = downloadTrackListArray.concat(recursiveFuncWorker(jsonData[i].children, path.join(pathString, jsonData[i].title)));
    } else {
      downloadTrackListArray.push({
        'path': path.join(pathString, jsonData[i].title),
        'url': jsonData[i].mediaDownloadUrl,
        'hash': jsonData[i].hash
      });
    }
  }
  return downloadTrackListArray;
}