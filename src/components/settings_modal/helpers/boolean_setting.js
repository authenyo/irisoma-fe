import Checkbox from 'src/components/checkbox/checkbox.vue'
import Setting from './setting.js'

export default {
  ...Setting,
  props: {
    ...Setting.props,
    indeterminateState: [String, Object]
  },
  components: {
    ...Setting.components,
    Checkbox
  },
  computed: {
    ...Setting.computed,
    isIndeterminate () {
      return this.visibleState === this.indeterminateState
    }
  },
  methods: {
    ...Setting.methods,
    getValue (e) {
      // Basic tri-state toggle implementation
      if (!!this.indeterminateState && !e && this.visibleState === true) {
        // If we have indeterminate state, switching from true to false first goes through indeterminate
        return this.indeterminateState
      }
      return e
    }
  }
}
