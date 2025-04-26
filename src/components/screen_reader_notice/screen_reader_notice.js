const ScreenReaderNotice = {
  props: {
    ariaLive: {
      type: String,
      defualt: 'assertive'
    }
  },
  data () {
    return {
      currentText: ''
    }
  },
  methods: {
    announce (text) {
      this.currentText = text
      setTimeout(() => { this.currentText = '' }, 1000)
    }
  }
}

export default ScreenReaderNotice
