#!/usr/bin/env node

'use strict'

const colors = require('colors')
const copydir = require('copy-dir')
const nopt = require('nopt')
const path = require("path")
const knownOpts = {
  "projectRoot": path,
  "scaffold": Boolean
}
const shortHands = {
  "p": ["--projectRoot"],
  "s": ["--scaffold"]
}
const parsed = nopt(knownOpts, shortHands, process.argv, 2)

const projectRoot = parsed.projectRoot || path.join(__dirname, '..', '..', '..')

if (parsed.scaffold) {
  copydir.sync(path.join(__dirname, 'scaffold'), projectRoot)
  console.log('scaffolded %s, check it out!'.green, projectRoot)
  console.log('(just an FYI, the scaffold uses async/await, make sure your Node supports that!)'.italic.bold.gray)
}