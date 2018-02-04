#!/usr/bin/env node

'use strict'

const colors = require('colors')
const copydir = require('copy-dir')
const nopt = require('nopt')
const noptUsage = require('nopt-usage')
const path = require('path')
const knownOpts = {
  "projectRoot": path,
  "scaffold": Boolean,
  "help": Boolean
}
const shortHands = {
  "p": ["--projectRoot"],
  "s": ["--scaffold"],
  "h": ["--help"]
}
const descriptions = {
  "projectRoot": "The root of the project, scaffold files will be placed here",
  "scaffold": "Should scaffold files be copied?",
  "help": "Prints this message"
}
const defaults = {
  "projectRoot": "process.cwd(), the current directory",
  "scaffold": false,
  "help": false
}
const usage = noptUsage(knownOpts, shortHands, descriptions, defaults)
const parsed = nopt(knownOpts, shortHands, process.argv, 2)

function printUsage() {
  console.log('\nSimple command line utility that will create most of the files necessary to get up and running quickly.\n\nUsage:\n\n%s\n', usage)
}

if (parsed.help) {
  return printUsage()
}

if (parsed.argv.original.length === 0) {
  return printUsage()
}

const projectRoot = parsed.projectRoot || process.cwd()

if (parsed.scaffold) {
  copydir.sync(path.join(__dirname, 'scaffold'), projectRoot)
  console.log('scaffolded %s, check it out!'.green, projectRoot)
  console.log('(just an FYI, the scaffold uses async/await, make sure your Node supports that!)'.italic.bold.gray)
}