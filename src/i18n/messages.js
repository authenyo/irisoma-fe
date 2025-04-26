// When contributing, please sort JSON before committing so it would be easier to see what's missing and what's being added compared to English and other languages. It's not obligatory, but just an advice.
// To sort json use jq https://stedolan.github.io/jq and invoke it like `jq -S . xx.json > xx.sorted.json`, AFAIK, there's no inplace edit option like in sed
// Also, when adding a new language to "messages" variable, please do it alphabetically by language code so that users can search or check their custom language easily.

// For anyone contributing to old huge messages.js and in need to quickly convert it to JSON
// sed command for converting currently formatted JS to JSON:
// sed -i -e "s/'//gm" -e 's/"/\\"/gm' -re 's/^( +)(.+?): ((.+?))?(,?)(\{?)$/\1"\2": "\4"/gm' -e 's/\"\{\"/{/g' -e 's/,"$/",/g' file.json
// There's only problem that apostrophe character ' gets replaced by \\ so you have to fix it manually, sorry.

import { isEqual } from 'lodash'
import { languages, langCodeToJsonName } from './languages.js'

const ULTIMATE_FALLBACK_LOCALE = 'en'

const hasLanguageFile = (code) => languages.includes(code)

const loadLanguageFile = (code) => {
  return import(
    /* webpackInclude: /\.json$/ */
    /* webpackChunkName: "i18n/[request]" */
    `./${langCodeToJsonName(code)}.json`
  )
}

const messages = {
  languages,
  default: {
    en: require('./en.json').default
  },
  setLanguage: async (i18n, language) => {
    const languages = (Array.isArray(language) ? language : [language]).filter(k => k)

    if (!languages.includes(ULTIMATE_FALLBACK_LOCALE)) {
      languages.push(ULTIMATE_FALLBACK_LOCALE)
    }
    const [first, ...rest] = languages

    if (first === i18n.locale && isEqual(rest, i18n.fallbackLocale)) {
      return
    }

    for (const lang of languages) {
      if (hasLanguageFile(lang)) {
        const messages = await loadLanguageFile(lang)
        i18n.setLocaleMessage(lang, messages.default)
      }
    }

    i18n.fallbackLocale = rest
    i18n.locale = first
  }
}

export default messages
