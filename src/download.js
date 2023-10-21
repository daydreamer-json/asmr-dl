const log4js = require('log4js');
const configData = require('./config/default.json');
const rjIdRegexParse = require('./component/rjIdRegexParse');
const apiGetWorkInfo = require('./component/apiConnect');
const optimizeTrackDb = require('./component/optimizeTrackDb');
const downloadWork = require('./component/downloadWorker');
const dispWorkInfo = require('./component/dispWorkInfo');

module.exports.download = async function download (logger, argv, id) {
  logger.level = argv.logLevel;
  const parsedIdObj = rjIdRegexParse(id);
  if (parsedIdObj === null) {
    logger.error(`Entered ID is invalid. Please input correct ID.`);
  } else {
    const apiWorkInfoObj = await apiGetWorkInfo(logger, argv, rjIdRegexParse(id));
    if (apiWorkInfoObj !== null) {
      dispWorkInfo(argv, apiWorkInfoObj);
      const downloadTrackListArray = optimizeTrackDb(apiWorkInfoObj);
      downloadWork(logger, argv, parsedIdObj, downloadTrackListArray, apiWorkInfoObj);
    }
  }
}