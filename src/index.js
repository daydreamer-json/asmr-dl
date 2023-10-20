#!/usr/bin/env node

const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const log4js = require('log4js');
const figlet = require("figlet");
const clear = require('clear');
const fs = require('fs');
const path = require('path');
const configData = require('./config/default.json');
const extComponents = {};
extComponents.lookup = require('./lookup');
extComponents.download = require('./download');
clear();
log4js.configure({
  appenders: {
    System: {
      type: 'stdout'
    }
  },
  categories: {
    default: {
      appenders: ['System'],
      level: 'info'
    }
  }
})
const logger = log4js.getLogger('System');
logger.trace('Program has been started.');


console.log('='.repeat(42));
console.log(figlet.textSync(configData.base.applicationName, {
  font: "Standard",
  whitespaceBreak: true,
}));
console.log('='.repeat(42) + '\n');


const argv = yargs(hideBin(process.argv))
  .scriptName(configData.base.applicationName)
  .command({
    command: 'download [id]',
    aliases: ['dl'],
    desc: 'Download ASMR work',
    builder: (yargs) => {
      yargs
        .positional('id', {
          describe: 'DLsite RJ Code (Work ID)',
          type: 'number',
        })
        .demandOption(['id'])
        .options({
          'output-dir': {
            alias: ['o'],
            desc: 'Output directory',
            default: path.join('.', 'output'),
            normalize: true,
            type: 'string'
          },
          'force': {
            alias: ['f'],
            desc: 'Force overwrites existing files',
            default: false,
            type: 'boolean'
          },
          'proxy': {
            desc: 'Use streaming API server',
            default: false,
            deprecated: true,
            type: 'boolean'
          },
          'disable-ping': {
            desc: 'Disable pinging the server\nThis option reduces startup time',
            default: false,
            deprecated: true,
            type: 'boolean'
          }
        })
    },
    handler: (argv) => {
      extComponents.download.download(logger, argv, argv.id);
    }
  })
  .command({
    command: 'lookup [id]',
    aliases: ['info'],
    desc: 'Display metadata of ASMR work',
    builder: (yargs) => {
      yargs
        .positional('id', {
          describe: 'DLsite RJ Code (Work ID)',
          type: 'number',
        })
        .demandOption(['id'])
    },
    handler: (argv) => {
      extComponents.lookup.lookup(logger, argv.id);
    }
  })
  .usage('$0 <command> [argument]')
  .epilogue(configData.base.applicationCopyrightShort)
  .demandCommand(1)
  .help('h')
  .version()
  .strict()
  .recommendCommands()
  .parse()
  .argv;



