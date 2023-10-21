const log4js = require('log4js');
const configData = require('../config/default.json');
const rjIdRegexParse = require('./rjIdRegexParse');
const clui = require('clui');
const cliProgress = require('cli-progress');
const color = require('ansi-colors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function createFolder (downloadTrackListArray, rootPath) {
  const tempArr1 = downloadTrackListArray.map((obj) => path.dirname(obj.path));
  const tempArr2 = Array.from(new Set(tempArr1));
  const folderList = tempArr2.map((obj) => path.resolve(path.join(rootPath, obj)));
  for (let i = 0; i < folderList.length; i++) {
    const folderPath = folderList[i];
    try {
      await fs.promises.access(folderPath);
    } catch (error) {
      await fs.promises.mkdir(folderPath, {recursive: true});
    }
  }
}

function isFileAlreadyExistsCheckSync (pathString) {
  try {
    fs.accessSync(pathString);
    return false;
  } catch (err) {
    return true;
  }
}

async function downloadFile (argv, logger, url, pathString, rootPath) {
  let writeMode = null;
  if (argv.force) {
    writeMode = 'w';
  } else {
    writeMode = 'wx';
  }
  if (writeMode === 'w' || (writeMode === 'wx' && isFileAlreadyExistsCheckSync(path.resolve(path.join(rootPath, pathString))) === true)) {
    const writer = fs.createWriteStream(path.resolve(path.join(rootPath, pathString)), {flags: writeMode});
    const response = await axios({
      'url': url,
      'method': 'GET',
      'headers': {
        'Referer': configData.api.refererUrl,
        'User-Agent': configData.api.userAgent
      },
      'responseType': 'stream'
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } else {
    // logger.trace(`File ${pathString} already exists. Skipped.`);
  }
}

async function saveMetadataToJsonFile (argv, apiWorkInfoObj, rootPath) {
  const prunedApiWorkInfoObj = apiWorkInfoObj.pruned;
  const excludeKeys = ['samCoverUrl', 'thumbnailCoverUrl', 'mainCoverUrl'];
  const optimizedApiWorkInfoObj = Object.keys(prunedApiWorkInfoObj)
    .filter(key => !excludeKeys.includes(key))
    .reduce((obj, key) => {
      obj[key] = prunedApiWorkInfoObj[key];
      return obj;
    }, {});
  const jsonFilename = 'info.json';
  let writeMode = null;
  if (argv.force) {
    writeMode = 'w';
  } else {
    writeMode = 'wx';
  }
  if (writeMode === 'w' || (writeMode === 'wx' && isFileAlreadyExistsCheckSync(path.resolve(path.join(rootPath, jsonFilename))) === true)) {
    try {
      await fs.promises.writeFile(path.resolve(path.join(rootPath, jsonFilename)), JSON.stringify(optimizedApiWorkInfoObj, null, '  '), {flags: writeMode});
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = async function downloadWork (logger, argv, id, downloadTrackListArray, apiWorkInfoObj) {
  logger.info(`Downloading RJ${id.parsed} ...`);
  if (argv.proxy === true) logger.info('Download using proxy.');
  const rootDirectory = path.join(path.resolve(argv.outputDir), `RJ${id.parsed}`);
  logger.debug(`Creating folder structure ...`);
  let spinner = new clui.Spinner ('Creating folder structure ...', configData.base.spinnerSeq);
  spinner.start();
  await createFolder(downloadTrackListArray, rootDirectory);
  spinner.stop();
  logger.debug(`Created folder structure.`);
  logger.debug(`Downloading files ...`);
  const totalFiles = downloadTrackListArray.length;
  let downloadedFiles = 0;
  let activeDownloads = 0;
  const progressBar = new cliProgress.SingleBar({
    format: '[' + color.green('{bar}') + '] {percentage}% | {value}/{total} files | {duration_formatted} | eta {eta_formatted} | {filename}',
    barsize: 65,
    fps: 10,
    barCompleteChar: '#',
    barIncompleteChar: '-',
    hideCursor: false,
    clearOnComplete: true
  });
  progressBar.start(downloadTrackListArray.length, 0, {"filename": ""});
  let fileUrl = null;
  for (let i = 0; i < downloadTrackListArray.length; i++) {
    while (activeDownloads >= argv.thread) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    activeDownloads++;
    progressBar.update(downloadedFiles, {"filename": downloadTrackListArray[i].path});
    if (argv.proxy === true) {
      fileUrl = `https://${configData.api.baseDomain[serverLocation]}${configData.api.apiPath}/media/stream/${downloadTrackListArray[i].hash}`;
    } else {
      fileUrl = downloadTrackListArray[i].url;
    }
    downloadFile(argv, logger, fileUrl, downloadTrackListArray[i].path, rootDirectory).then(() => {
      downloadedFiles++;
      progressBar.update(downloadedFiles);
      activeDownloads--;
      if (downloadedFiles === totalFiles) {
        progressBar.stop();
        logger.info('Finalizing ...');
        downloadFile(argv, logger, apiWorkInfoObj.pruned.mainCoverUrl, 'cover.jpg', rootDirectory).then(() => {
          logger.info('Finalized.');
          if (argv.saveMetadata === true) {
            logger.info('Saving metadata ...');
            saveMetadataToJsonFile(argv, apiWorkInfoObj, rootDirectory).then(() => {
              logger.info('Saved metadata.');
              logger.info('All files downloaded successfully.');
            })
          } else {
            logger.info('All files downloaded successfully.');
          }
        }).catch((error) => {
          logger.error(`Error while finalizing: ${error.message}`);
          if (error.response && error.response.status >= 400) {
            console.error(`Request error: ${error.response.status} ${error.response.statusText}`);
          }
        });
      }
    }).catch((error) => {
      logger.error(`Error while downloading file ${path.basename(downloadTrackListArray[i].path)}: ${error.message}`);
      activeDownloads--;
      if (error.response && error.response.status >= 400) {
        console.error(`Request error: ${error.response.status} ${error.response.statusText}`);
      }
    });
  }
}