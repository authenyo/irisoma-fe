const fileSizeFormat = (numArg) => {
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB']
  let num = numArg
  if (num < 1) {
    return num + ' ' + units[0]
  }

  const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1024)), units.length - 1)
  num = (num / Math.pow(1024, exponent)).toFixed(2) * 1
  const unit = units[exponent]
  return { num, unit }
}
const fileSizeFormatService = {
  fileSizeFormat
}
export default fileSizeFormatService
