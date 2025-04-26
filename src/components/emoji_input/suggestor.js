/**
 * suggest - generates a suggestor function to be used by emoji-input
 * data: object providing source information for specific types of suggestions:
 * data.emoji - optional, an array of all emoji available i.e.
 *   (getters.standardEmojiList + state.instance.customEmoji)
 * data.users - optional, an array of all known users
 * updateUsersList - optional, a function to search and append to users
 *
 * Depending on data present one or both (or none) can be present, so if field
 * doesn't support user linking you can just provide only emoji.
 */

export default data => {
  const emojiCurry = suggestEmoji(data.emoji)
  const usersCurry = data.store && suggestUsers(data.store)
  return (input, nameKeywordLocalizer) => {
    const firstChar = input[0]
    if (firstChar === ':' && data.emoji) {
      return emojiCurry(input, nameKeywordLocalizer)
    }
    if (firstChar === '@' && usersCurry) {
      return usersCurry(input)
    }
    return []
  }
}

export const suggestEmoji = emojis => (input, nameKeywordLocalizer) => {
  const noPrefix = input.toLowerCase().substr(1)
  return emojis
    .map(emoji => ({ ...emoji, ...nameKeywordLocalizer(emoji) }))
    .filter((emoji) => (emoji.names.concat(emoji.keywords)).filter(kw => kw.toLowerCase().match(noPrefix)).length)
    .map(k => {
      let score = 0

      // An exact match always wins
      score += Math.max(...k.names.map(name => name.toLowerCase() === noPrefix ? 200 : 0), 0)

      // Prioritize custom emoji a lot
      score += k.imageUrl ? 100 : 0

      // Prioritize prefix matches somewhat
      score += Math.max(...k.names.map(kw => kw.toLowerCase().startsWith(noPrefix) ? 10 : 0), 0)

      // Sort by length
      score -= k.displayText.length

      k.score = score
      return k
    })
    .sort((a, b) => {
      // Break ties alphabetically
      const alphabetically = a.displayText > b.displayText ? 0.5 : -0.5

      return b.score - a.score + alphabetically
    })
}

export const suggestUsers = ({ dispatch, state }) => {
  // Keep some persistent values in closure, most importantly for the
  // custom debounce to work. Lodash debounce does not return a promise.
  let suggestions = []
  let previousQuery = ''
  let timeout = null
  let cancelUserSearch = null

  const userSearch = (query) => dispatch('searchUsers', { query })
  const debounceUserSearch = (query) => {
    cancelUserSearch && cancelUserSearch()
    return new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
        userSearch(query).then(resolve).catch(reject)
      }, 300)
      cancelUserSearch = () => {
        clearTimeout(timeout)
        resolve([])
      }
    })
  }

  return async input => {
    const noPrefix = input.toLowerCase().substr(1)
    if (previousQuery === noPrefix) return suggestions

    suggestions = []
    previousQuery = noPrefix
    // Fetch more and wait, don't fetch if there's the 2nd @ because
    // the backend user search can't deal with it.
    // Reference semantics make it so that we get the updated data after
    // the await.
    if (!noPrefix.includes('@')) {
      await debounceUserSearch(noPrefix)
    }

    const newSuggestions = state.users.users.filter(
      user =>
        user.screen_name && user.name && (
          user.screen_name.toLowerCase().startsWith(noPrefix) ||
            user.name.toLowerCase().startsWith(noPrefix))
    ).slice(0, 20).sort((a, b) => {
      let aScore = 0
      let bScore = 0

      // Matches on screen name (i.e. user@instance) makes a priority
      aScore += a.screen_name.toLowerCase().startsWith(noPrefix) ? 2 : 0
      bScore += b.screen_name.toLowerCase().startsWith(noPrefix) ? 2 : 0

      // Matches on name takes second priority
      aScore += a.name.toLowerCase().startsWith(noPrefix) ? 1 : 0
      bScore += b.name.toLowerCase().startsWith(noPrefix) ? 1 : 0

      const diff = (bScore - aScore) * 10

      // Then sort alphabetically
      const nameAlphabetically = a.name > b.name ? 1 : -1
      const screenNameAlphabetically = a.screen_name > b.screen_name ? 1 : -1

      return diff + nameAlphabetically + screenNameAlphabetically
      /* eslint-disable camelcase */
    }).map((user) => ({
      user,
      displayText: user.screen_name_ui,
      detailText: user.name,
      imageUrl: user.profile_image_url_original,
      replacement: '@' + user.screen_name + ' '
    }))
    /* eslint-enable camelcase */

    suggestions = newSuggestions || []
    return suggestions
  }
}
