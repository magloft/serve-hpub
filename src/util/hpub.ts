import { capitalCase } from 'change-case'
import { basename, extname } from 'path'

export interface ManifestEntry {
  id: number
  name: string
  unlock_type: string
  title: string
  source: string
  screenshots: string[]
  info: string
  date: string
  url: string
  cover: string
  categories: string[]
}

export function getManifest(hostname: string, port: number, name: string, index: number): ManifestEntry {
  return {
    id: index + 1,
    name: name,
    unlock_type: 'free',
    title: capitalCase(basename(name, extname(name))),
    source: 'hpub',
    screenshots: [],
    info: name,
    date: '2018-01-01 00:00:00',
    url: `http://${hostname}:${port}/hpub/${name}.hpub`,
    cover: `http://${hostname}:${port}/${name}/cover.png`,
    categories: []
  }
}
