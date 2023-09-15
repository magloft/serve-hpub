import express from 'express'
import { Response } from 'express-serve-static-core'
import 'express-zip'
import { existsSync, lstatSync } from 'fs'
import { sync } from 'glob'
import path, { join } from 'path'
import process from 'process'
import payload from '../data/payload.json'
import { getManifest } from '../util/hpub'

type HpubResponse = Response<any, Record<string, any>, number> & { zip?: (contents: object, value: string) => void }

export interface ServeArgs {
  glob: string
  hostname: string
  port: number
}

export function serve({ glob, hostname, port }: ServeArgs) {
  const app = express()

  app.get('/hpub/:path.hpub', (req, res: HpubResponse) => {
    const hpubPath = join('.', req.params.path)
    if (existsSync(hpubPath)) {
      if (lstatSync(hpubPath).isDirectory()) {
        const zipContents = sync(`${hpubPath}/**/*`)
          .filter(file_path => lstatSync(file_path).isFile())
          .map(file_path => ({ path: file_path, name: path.relative(hpubPath, file_path) }))
        res.zip!(zipContents, `${path.basename(hpubPath)}.hpub`)
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
    res.json({
      ...payload, manifest: sync(glob).map((name, index) => {
        return getManifest(hostname, port, name, index)
      })
    })
  })

  app.get('/manifest.json', function (req, res) {
    res.json(sync(glob).map((name, index) => {
      return getManifest(hostname, port, name, index)
    }))
  })

  console.info(`server listening on http://${hostname}:${port}/`)
  console.info(`- info: http://${hostname}:${port}/info.json`)
  console.info(`- manifest: http://${hostname}:${port}/manifest.json`)
  app.listen(port)
}
