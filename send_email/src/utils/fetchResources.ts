import axios from 'axios'

import { RemoteResourceInfo, RemoteResource } from '../types/RemoteResources'

const fetchResource = async (info: RemoteResourceInfo) => {
  return {
    info: info,
    content: (await axios.get(info.url)).data as string
  }
}

const fetchResources = async (infos: RemoteResourceInfo[]) => {
  const resources: RemoteResource[] = []

  await Promise.all(
    infos.map(async value => {
      resources.push(await fetchResource(value))
    })
  )

  return resources
}

export default fetchResources
