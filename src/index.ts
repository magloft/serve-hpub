#!/usr/bin/env node
import express from 'express'
import { Response } from 'express-serve-static-core'
import 'express-zip'
import { existsSync, lstatSync } from 'fs'
import { sync } from 'glob'
import path, { join } from 'path'
import process from 'process'
import payload from './data/payload.json'
import { getManifest } from './util/hpub'
import { ipAddress, port } from './util/network'

type HpubResponse = Response<any, Record<string, any>, number> & { zip?: (contents: object, value: string) => void }

const app = express()

app.get('/hpub/:path', (req, res: HpubResponse) => {
  const hpubPath = join('.', req.params.path)
  if (existsSync(hpubPath)) {
    if (lstatSync(hpubPath).isDirectory()) {
      const zipContents = sync(`${hpubPath}/**/*`)
        .filter(file_path => lstatSync(file_path).isFile())
        .map(file_path => ({ path: file_path, name: path.relative(hpubPath, file_path) }))
      res.zip!(zipContents, path.basename(hpubPath))
    } else {
      res.sendFile(hpubPath, { root: process.cwd() })
    }
  } else {
    res.status(404)
    res.end('File not Found')
  }
})

app.get('/:path*.png', function (req, res) {
  const coverPath = join('.', req.path)
  if (existsSync(coverPath)) {
    res.sendFile(coverPath, { root: process.cwd() })
  } else {
    res.status(404)
    res.end('File not Found')
  }
})

app.get('/info.json', function (req, res) {
  res.json({ ...payload, manifest: sync('**/*.hpub').map(getManifest) })
})

app.get('/manifest.json', function (req, res) {
  res.json(sync('**/*.hpub').map(getManifest))
})

console.info(`- manifest server listening at http://${ipAddress}:${port}/manifest.json\n`)
app.listen(port)
