export const mentionMatchesUrl = (attention, url) => {
  if (url === attention.statusnet_profile_url) {
    return true
  }
  const [namepart, instancepart] = attention.screen_name.split('@')
  const matchstring = new RegExp('://' + instancepart + '/.*' + namepart + '$', 'g')

  return !!url.match(matchstring)
}

/**
 * Extract tag name from pleroma or mastodon url.
 * i.e https://bikeshed.party/tag/photo or https://quey.org/tags/sky
 * @param {string} url
 */
export const extractTagFromUrl = (url) => {
  const decoded = decodeURI(url)
  // https://git.pleroma.social/pleroma/elixir-libraries/linkify/-/blob/master/lib/linkify/parser.ex
  // https://www.pcre.org/original/doc/html/pcrepattern.html
  const regex = /tag[s]*\/([\p{L}\p{N}_]*[\p{Alphabetic}_·\u{200c}][\p{L}\p{N}_·\p{M}\u{200c}]*)$/ug
  const result = regex.exec(decoded)
  if (!result) {
    return false
  }
  return result[1]
}
