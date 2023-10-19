const configData = require('../config/default.json');
const clui = require('clui');
const clc = require('cli-color');
const log4js = require('log4js');
const axios = require('axios');

async function apiGetHealth () {
  try {
    const response = await axios.get(
      `${configData.api.baseUrl}/health`,
      {
        'headers': {
          'Referer': configData.api.refererUrl,
          'User-Agent': configData.api.userAgent
        }
      }
    );
    if (response.data === 'OK') {
      return 'OK';
    } else {
      return 'NG';
    }
  } catch (error) {
    return 'NG';
  }
}

async function apiConnectGetBasicWorkInfo (logger, id) {
  try {
    const response = await axios.get(
      `${configData.api.baseUrl}/work/${id}`,
      {
        'headers': {
          'Referer': configData.api.refererUrl,
          'User-Agent': configData.api.userAgent
        }
      }
    );
    return response.data;
  } catch (error) {
    return error.response;
  }
}

async function apiConnectGetPrunedWorkInfo (logger, id) {
  try {
    const response = await axios.get(
      `${configData.api.baseUrl}/workInfo/${id}`,
      {
        'headers': {
          'Referer': configData.api.refererUrl,
          'User-Agent': configData.api.userAgent
        }
      }
    );
    return response.data;
  } catch (error) {
    return error.response;
  }
}

async function apiConnectGetWorkTracksInfo (logger, id) {
  try {
    const response = await axios.get(
      `${configData.api.baseUrl}/tracks/${id}`,
      {
        'headers': {
          'Referer': configData.api.refererUrl,
          'User-Agent': configData.api.userAgent
        }
      }
    );
    return response.data;
  } catch (error) {
    return error.response;
  }
}


module.exports = async function apiGetWorkInfo (logger, id) {
  logger.debug('Checking API health ...');
  let spinner = new clui.Spinner ('Checking API health ...', configData.base.spinnerSeq)
  spinner.start();
  const apiHealthString = await apiGetHealth();
  if (apiHealthString === 'OK') {
    spinner.stop();
    logger.debug('API is healthy.');

    const apiWorkInfoObj = {};
    logger.debug(`Getting work info of ID RJ${id.parsed} ...`);
    spinner = new clui.Spinner (`Getting work info of ID RJ${id.parsed} ...`, configData.base.spinnerSeq);
    spinner.start();
    apiWorkInfoObj.basic = await apiConnectGetBasicWorkInfo(logger, id.raw);
    apiWorkInfoObj.pruned = await apiConnectGetPrunedWorkInfo(logger, id.raw);
    apiWorkInfoObj.tracks = await apiConnectGetWorkTracksInfo(logger, id.raw);
    spinner.stop();
    if (apiWorkInfoObj.basic.status && apiWorkInfoObj.basic.status >= 400) {
      logger.error(`API request error: HTTP ${apiWorkInfoObj.basic.status} ${apiWorkInfoObj.basic.statusText}`);
      logger.error(`API response body: ${JSON.stringify(apiWorkInfoObj.basic.data)}`);
      return null;
    } else {
      logger.debug(`Work information was successfully fetched.`);
      return apiWorkInfoObj;
    }
  } else if (apiHealthString === 'NG') {
    logger.error('API is not healthy.');
    return null;
  }
}