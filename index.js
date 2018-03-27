#!/usr/bin/env node
const process = require('process')
const glob = require('glob')
const path = require('path')
const fs = require('fs')
const changeCase = require('change-case')
const express = require('express')
require('express-zip')
const app = express()
const port = 8989

// Get IP address
let address, ifaces = require('os').networkInterfaces()
for (var dev in ifaces) {
  ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === false ? address = details.address : undefined)
}

app.get('/hpub/:path*', function(req, res) {
  const hpub_path = req.params['path'] + req.params[0]
  if (fs.existsSync(hpub_path)) {
    if (fs.lstatSync(hpub_path).isDirectory()) {
      const zipContents = glob.sync(`${hpub_path}/**/*`)
        .filter(file_path => fs.lstatSync(file_path).isFile())
        .map(file_path => ({ path: file_path, name: path.relative(hpub_path, file_path) }))
      res.zip(zipContents, path.basename(hpub_path))
    }else{
      res.sendFile(hpub_path, { root: process.cwd() })
    }
  }else{
    res.status(404)
    res.end('File not Found')
  }
})

app.get('/manifest.json', function(req, res) {
  res.json(glob.sync('**/*.hpub').map((hpub_path, index) => ({
    'id': index + 1,
    'name': hpub_path,
    'unlock_type': 'free',
    'title': changeCase.titleCase(path.basename(hpub_path, path.extname(hpub_path))),
    'source': 'hpub',
    'screenshots': [],
    'info': hpub_path,
    'date': '2018-01-01 00:00:00',
    'url': `http://${address}:${port}/hpub/${hpub_path}`,
    'categories': []
  })))
})

process.stdout.write(`- manifest server listening at http://${address}:${port}/manifest.json\n`)
app.listen(port)
