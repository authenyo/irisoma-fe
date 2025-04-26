import { capitalize } from 'lodash'

export function humanizeErrors (errors) {
  return Object.entries(errors).reduce((errs, [k, val]) => {
    const message = val.reduce((acc, message) => {
      const key = capitalize(k.replace(/_/g, ' '))
      return acc + [key, message].join(' ') + '. '
    }, '')
    return [...errs, message]
  }, [])
}
