import Popover from '../popover/popover.vue'
import EmojiPicker from '../emoji_picker/emoji_picker.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faSmileBeam } from '@fortawesome/free-regular-svg-icons'

library.add(
  faPlus,
  faTimes,
  faSmileBeam
)

const ReactButton = {
  props: ['status'],
  data () {
    return {
      filterWord: '',
      expanded: false
    }
  },
  components: {
    Popover,
    EmojiPicker
  },
  methods: {
    addReaction (event) {
      const emoji = event.insertion
      const existingReaction = this.status.emoji_reactions.find(r => r.name === emoji)
      if (existingReaction && existingReaction.me) {
        this.$store.dispatch('unreactWithEmoji', { id: this.status.id, emoji })
      } else {
        this.$store.dispatch('reactWithEmoji', { id: this.status.id, emoji })
      }
    },
    show () {
      if (!this.expanded) {
        this.$refs.picker.showPicker()
      }
    },
    onShow () {
      this.expanded = true
    },
    onClose () {
      this.expanded = false
    }
  },
  computed: {
    hideCustomEmoji () {
      return !this.$store.state.instance.pleromaCustomEmojiReactionsAvailable
    }
  }
}

export default ReactButton
