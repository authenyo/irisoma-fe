import Modal from 'src/components/modal/modal.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import pleromaTan from 'src/assets/pleromatan_apology.png'
import pleromaTanFox from 'src/assets/pleromatan_apology_fox.png'
import pleromaTanMask from 'src/assets/pleromatan_apology_mask.png'
import pleromaTanFoxMask from 'src/assets/pleromatan_apology_fox_mask.png'

import {
  faTimes
} from '@fortawesome/free-solid-svg-icons'
library.add(
  faTimes
)

export const CURRENT_UPDATE_COUNTER = 1

const UpdateNotification = {
  data () {
    return {
      showingImage: false,
      pleromaTanVariant: Math.random() > 0.5 ? pleromaTan : pleromaTanFox,
      showingMore: false
    }
  },
  components: {
    Modal
  },
  computed: {
    pleromaTanStyles () {
      const mask = this.pleromaTanVariant === pleromaTan ? pleromaTanMask : pleromaTanFoxMask
      return {
        'shape-outside': 'url(' + mask + ')'
      }
    },
    shouldShow () {
      return !this.$store.state.instance.disableUpdateNotification &&
        this.$store.state.users.currentUser &&
        this.$store.state.serverSideStorage.flagStorage.updateCounter < CURRENT_UPDATE_COUNTER &&
        !this.$store.state.serverSideStorage.prefsStorage.simple.dontShowUpdateNotifs
    }
  },
  methods: {
    toggleShow () {
      this.showingMore = !this.showingMore
    },
    neverShowAgain () {
      this.toggleShow()
      this.$store.commit('setFlag', { flag: 'updateCounter', value: CURRENT_UPDATE_COUNTER })
      this.$store.commit('setPreference', { path: 'simple.dontShowUpdateNotifs', value: true })
      this.$store.dispatch('pushServerSideStorage')
    },
    dismiss () {
      this.$store.commit('setFlag', { flag: 'updateCounter', value: CURRENT_UPDATE_COUNTER })
      this.$store.dispatch('pushServerSideStorage')
    }
  },
  mounted () {
    this.contentHeightNoImage = this.$refs.animatedText.scrollHeight

    // Workaround to get the text height only after mask loaded. A bit hacky.
    const newImg = new Image()
    newImg.onload = () => {
      setTimeout(() => { this.showingImage = true }, 100)
    }
    newImg.src = this.pleromaTanVariant === pleromaTan ? pleromaTanMask : pleromaTanFoxMask
  }
}

export default UpdateNotification
