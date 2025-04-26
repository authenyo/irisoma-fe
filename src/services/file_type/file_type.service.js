// TODO this func might as well take the entire file and use its mimetype
// or the entire service could be just mimetype service that only operates
// on mimetypes and not files. Currently the naming is confusing.
export const fileType = mimetype => {
  if (mimetype.match(/flash/)) {
    return 'flash'
  }

  if (mimetype.match(/text\/html/)) {
    return 'html'
  }

  if (mimetype.match(/image/)) {
    return 'image'
  }

  if (mimetype.match(/video/)) {
    return 'video'
  }

  if (mimetype.match(/audio/)) {
    return 'audio'
  }

  return 'unknown'
}

export const fileTypeExt = url => {
  if (url.match(/\.(png|jpe?g|gif|webp|avif)$/)) {
    return 'image'
  }
  if (url.match(/\.(ogv|mp4|webm|mov)$/)) {
    return 'video'
  }
  if (url.match(/\.(it|s3m|mod|umx|mp3|aac|m4a|flac|alac|ogg|oga|opus|wav|ape|midi?)$/)) {
    return 'audio'
  }
  return 'unknown'
}

export const fileMatchesSomeType = (types, file) =>
  types.some(type => fileType(file.mimetype) === type)

const fileTypeService = {
  fileType,
  fileTypeExt,
  fileMatchesSomeType
}

export default fileTypeService
