import Select from 'src/components/select/select.vue'
import Setting from './setting.js'

export default {
  ...Setting,
  components: {
    ...Setting.components,
    Select
  },
  props: {
    ...Setting.props,
    options: {
      type: Array,
      required: false
    },
    optionLabelMap: {
      type: Object,
      required: false,
      default: {}
    }
  },
  computed: {
    ...Setting.computed,
    realOptions () {
      if (this.realSource === 'admin') {
        return this.backendDescriptionSuggestions.map(x => ({
          key: x,
          value: x,
          label: this.optionLabelMap[x] || x
        }))
      }
      return this.options
    }
  },
  methods: {
    ...Setting.methods,
    getValue (e) {
      return e
    }
  }
}
