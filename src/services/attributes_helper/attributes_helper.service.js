import { kebabCase } from 'lodash'

const propsToNative = props => Object.keys(props).reduce((acc, cur) => {
  acc[kebabCase(cur)] = props[cur]
  return acc
}, {})

export { propsToNative }
