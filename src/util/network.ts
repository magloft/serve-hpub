import { NetworkInterfaceInfo, networkInterfaces } from 'os'

export function getHostname(): string {
  const groups = networkInterfaces()
  const interfaces = Object.values(groups).reduce<NetworkInterfaceInfo[]>((arr, group) => {
    arr.push(...group!)
    return arr
  }, [])
  const interfaceInfo = interfaces.find(({ family, internal }) => family === 'IPv4' && !internal)
  if (!interfaceInfo) { throw new Error('No network interface found') }
  return interfaceInfo.address
}
