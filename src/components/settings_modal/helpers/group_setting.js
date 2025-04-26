import { isEqual } from 'lodash'

import Setting from './setting.js'

export default {
  ...Setting,
  computed: {
    ...Setting.computed,
    isDirty () {
      return !isEqual(this.state, this.draft)
    }
  }
}
