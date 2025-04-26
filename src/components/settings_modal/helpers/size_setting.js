import Select from 'src/components/select/select.vue'
import Setting from './setting.js'

export const allCssUnits = ['cm', 'mm', 'in', 'px', 'pt', 'pc', 'em', 'ex', 'ch', 'rem', 'vw', 'vh', 'vmin', 'vmax', '%']
export const defaultHorizontalUnits = ['px', 'rem', 'vw']
export const defaultVerticalUnits = ['px', 'rem', 'vh']

export default {
  ...Setting,
  components: {
    ...Setting.components,
    Select
  },
  props: {
    ...Setting.props,
    min: Number,
    units: {
      type: Array,
      default: () => allCssUnits
    }
  },
  computed: {
    ...Setting.computed,
    stateUnit () {
      return this.state.replace(/\d+/, '')
    },
    stateValue () {
      return this.state.replace(/\D+/, '')
    }
  },
  methods: {
    ...Setting.methods,
    updateValue (e) {
      this.configSink(this.path, parseInt(e.target.value) + this.stateUnit)
    },
    updateUnit (e) {
      this.configSink(this.path, this.stateValue + e.target.value)
    }
  }
}
