const log4js = require('log4js');
const configData = require('./config/default.json');
const rjIdRegexParse = require('./component/rjIdRegexParse');
const apiGetWorkInfo = require('./component/apiConnect');

module.exports.lookup = async function (logger, id) {
  parsedIdObj = rjIdRegexParse(id);
  if (parsedIdObj === null) {
    logger.error(`Entered ID is invalid. Please input correct ID.`);
  } else {
    const apiWorkInfoObj = await apiGetWorkInfo(logger, rjIdRegexParse(id));
    if (apiWorkInfoObj !== null) {
      console.table({
        "Released Date": apiWorkInfoObj.pruned.release,
        "Published Date": apiWorkInfoObj.pruned.create_date,
        "RJ Code": 'RJ' + rjIdRegexParse(id).parsed,
        "Title": apiWorkInfoObj.pruned.title,
        "Voice Actors": apiWorkInfoObj.pruned.vas.map((obj) => obj.name).join(', '),
        "Provider Name": apiWorkInfoObj.pruned.circle.name,
        "NSFW Flag": apiWorkInfoObj.pruned.nsfw,
        "DL Count": apiWorkInfoObj.pruned.dl_count,
        "Price (JPY)": apiWorkInfoObj.pruned.price,
        "Tags": apiWorkInfoObj.pruned.tags.map((obj) => obj.i18n[configData.base.uiJsonLang].name).join(', '),
        "DLsite Link": `https://www.dlsite.com/home/work/=/product_id/RJ${rjIdRegexParse(id).parsed}.html`
      });
    }
  }
}