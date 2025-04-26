import Setting from './setting.js'

export default {
  ...Setting,
  props: {
    ...Setting.props,
    truncate: {
      type: Number,
      required: false,
      default: 1
    }
  },
  methods: {
    ...Setting.methods,
    getValue (e) {
      if (!this.truncate === 1) {
        return parseInt(e.target.value)
      } else if (this.truncate > 1) {
        return Math.trunc(e.target.value / this.truncate) * this.truncate
      }
      return parseFloat(e.target.value)
    }
  }
}
