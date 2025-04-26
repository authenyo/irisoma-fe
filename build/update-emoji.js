
module.exports = {
  updateEmoji () {
    const emojis = require('@kazvmoe-infra/unicode-emoji-json/data-by-group')
    const fs = require('fs')

    Object.keys(emojis)
      .map(k => {
        emojis[k].map(e => {
          delete e.unicode_version
          delete e.emoji_version
          delete e.skin_tone_support_unicode_version
        })
      })

    const res = {}
    Object.keys(emojis)
      .map(k => {
        const groupId = k.replace('&', 'and').replace(/ /g, '-').toLowerCase()
        res[groupId] = emojis[k]
      })

    console.info('Updating emojis...')
    fs.writeFileSync('static/emoji.json', JSON.stringify(res))
    console.info('Done.')
  }
}
