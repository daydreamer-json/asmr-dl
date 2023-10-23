const rjIdRegexParse = require('./rjIdRegexParse');

module.exports = (argv, apiWorkInfoObj) => {
  let vadisp = null;
  let tagdisp = null;
  if (apiWorkInfoObj.pruned.vas.length !== 0 && apiWorkInfoObj.pruned.vas[0].id !== '83a442aa-3662-5e17-aece-757bc3cb97cd' && apiWorkInfoObj.pruned.vas[0].name !== 'N/A') {
    vadisp = apiWorkInfoObj.pruned.vas.map((obj) => obj.name).join(', ');
  } else {
    vadisp = '---';
  }
  if (apiWorkInfoObj.pruned.tags.length !== 0) {
    tagdisp = apiWorkInfoObj.pruned.tags.map(function (obj) {
      if (Object.keys(obj.i18n).length === 0) {
        return obj.name;
      } else {
        return obj.i18n[argv.lang].name;
      }
    }).join(', ');
  } else {
    tagdisp = '---'
  }
  console.table({
    "Released Date": apiWorkInfoObj.pruned.release,
    "Published Date": apiWorkInfoObj.pruned.create_date,
    "RJ Code": 'RJ' + rjIdRegexParse(apiWorkInfoObj.pruned.id).parsed,
    "Title": apiWorkInfoObj.pruned.title,
    "Voice Actors": vadisp,
    "Provider Name": apiWorkInfoObj.pruned.circle.name,
    "NSFW Flag": apiWorkInfoObj.pruned.nsfw,
    "DL Count": apiWorkInfoObj.pruned.dl_count,
    "Price (JPY)": apiWorkInfoObj.pruned.price,
    "Tags":tagdisp,
    "DLsite Link": `https://www.dlsite.com/home/work/=/product_id/RJ${rjIdRegexParse(apiWorkInfoObj.pruned.id).parsed}.html`
  });
}