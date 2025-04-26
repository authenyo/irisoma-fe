const StillImage = {
  props: [
    'src',
    'referrerpolicy',
    'mimetype',
    'imageLoadError',
    'imageLoadHandler',
    'alt',
    'height',
    'width',
    'dataSrc',
    'loading'
  ],
  data () {
    return {
      // for lazy loading, see loadLazy()
      realSrc: this.src,
      stopGifs: this.$store.getters.mergedConfig.stopGifs
    }
  },
  computed: {
    animated () {
      if (!this.realSrc) {
        return false
      }

      return this.stopGifs && (this.mimetype === 'image/gif' || this.realSrc.endsWith('.gif'))
    },
    style () {
      const appendPx = (str) => /\d$/.test(str) ? str + 'px' : str
      return {
        height: this.height ? appendPx(this.height) : null,
        width: this.width ? appendPx(this.width) : null
      }
    }
  },
  methods: {
    loadLazy () {
      if (this.dataSrc) {
        this.realSrc = this.dataSrc
      }
    },
    onLoad () {
      if (!this.realSrc) {
        return
      }
      const image = this.$refs.src
      if (!image) return
      this.imageLoadHandler && this.imageLoadHandler(image)
      const canvas = this.$refs.canvas
      if (!canvas) return
      const width = image.naturalWidth
      const height = image.naturalHeight
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(image, 0, 0, width, height)
    },
    onError () {
      this.imageLoadError && this.imageLoadError()
    }
  },
  watch: {
    src () {
      this.realSrc = this.src
    },
    dataSrc () {
      this.$el.removeAttribute('data-loaded')
    }
  }
}

export default StillImage
