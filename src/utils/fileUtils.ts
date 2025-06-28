
export const decodeFileName = (fileName: string): string => {
  return decodeURIComponent(fileName.replace(/%20/g, ' '))
}
