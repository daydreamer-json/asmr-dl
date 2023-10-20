const log4js = require('log4js');
const configData = require('./config/default.json');
const rjIdRegexParse = require('./component/rjIdRegexParse');
const apiGetWorkInfo = require('./component/apiConnect');
const dispWorkInfo = require('./component/dispWorkInfo');

module.exports.lookup = async function (logger, argv, id) {
  logger.level = argv.logLevel;
  parsedIdObj = rjIdRegexParse(id);
  if (parsedIdObj === null) {
    logger.error(`Entered ID is invalid. Please input correct ID.`);
  } else {
    const apiWorkInfoObj = await apiGetWorkInfo(logger, argv, rjIdRegexParse(id));
    if (apiWorkInfoObj !== null) {
      dispWorkInfo(argv, apiWorkInfoObj);
    }
  }
}