const configData = require('../config/default.json');
const mathComponent = require('./math');
const clui = require('clui');
const clc = require('cli-color');
const log4js = require('log4js');
const axios = require('axios');
const ping = require('ping');

async function apiSendVerifyPing () {
  let extraArg = [];
  if (process.platform === 'win32') {
    extraArg = ['-n', '4'];
  } else {
    extraArg = ['-i', '0.3', '-c', '4'];
  }
  const response = await ping.promise.probe(`${configData.api.baseDomain}`, {
    timeout: 10,
    extra: extraArg
  });
  return response;
}


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


module.exports = async function apiGetWorkInfo (logger, argv, id) {
  let apiPingString = null;
  if (argv.disablePing === false) {
    logger.debug('Pinging ...');
    let spinner = new clui.Spinner ('Pinging ...', configData.base.spinnerSeq);
    spinner.start();
    apiPingString = await apiSendVerifyPing();
    spinner.stop();
    if (apiPingString.alive === false) {
      logger.error('API is not reachable.');
      return null;
    } else {
      logger.trace(`API ping time list: ${JSON.stringify(apiPingString.times)}`);
      logger.trace(`API ping statistics: Min=${apiPingString.min}ms, Max=${apiPingString.max}ms, Avg=${mathComponent.rounder('ceil', apiPingString.times.map(Number).reduce((a,b)=>a+b) / apiPingString.times.length, 3, true)}ms, Loss=${apiPingString.packetLoss}`);
      logger.debug('API is reachable.');
    }
  } else {
    logger.debug('Pinging is disabled.');
  }
  if (apiPingString === null || apiPingString.alive === true) {
    logger.debug('Checking API health ...');
    let spinner = new clui.Spinner ('Checking API health ...', configData.base.spinnerSeq)
    spinner.start();
    const apiHealthString = await apiGetHealth();
    if (apiHealthString === 'OK') {
      spinner.stop();
      logger.debug('API is healthy.');
      const apiWorkInfoObj = {};
      logger.info(`Getting work info of ID RJ${id.parsed} ...`);
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
        logger.info(`Work information was successfully fetched.`);
        return apiWorkInfoObj;
      }
    } else if (apiHealthString === 'NG') {
      logger.error('API is not healthy.');
      return null;
    }
  }
}