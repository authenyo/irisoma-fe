import Popover from '../popover/popover.vue'
import genRandomSeed from '../../services/random_seed/random_seed.service.js'
import ConfirmModal from '../confirm_modal/confirm_modal.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faEllipsisH,
  faBookmark,
  faEyeSlash,
  faThumbtack,
  faShareAlt,
  faExternalLinkAlt,
  faHistory,
  faPlus,
  faTimes
} from '@fortawesome/free-solid-svg-icons'
import {
  faBookmark as faBookmarkReg,
  faFlag
} from '@fortawesome/free-regular-svg-icons'

library.add(
  faEllipsisH,
  faBookmark,
  faBookmarkReg,
  faEyeSlash,
  faThumbtack,
  faShareAlt,
  faExternalLinkAlt,
  faFlag,
  faHistory,
  faPlus,
  faTimes
)

const ExtraButtons = {
  props: ['status'],
  components: {
    Popover,
    ConfirmModal
  },
  data () {
    return {
      expanded: false,
      showingDeleteDialog: false,
      randomSeed: genRandomSeed()
    }
  },
  methods: {
    onShow () {
      this.expanded = true
    },
    onClose () {
      this.expanded = false
    },
    deleteStatus () {
      if (this.shouldConfirmDelete) {
        this.showDeleteStatusConfirmDialog()
      } else {
        this.doDeleteStatus()
      }
    },
    doDeleteStatus () {
      this.$store.dispatch('deleteStatus', { id: this.status.id })
      this.hideDeleteStatusConfirmDialog()
    },
    showDeleteStatusConfirmDialog () {
      this.showingDeleteDialog = true
    },
    hideDeleteStatusConfirmDialog () {
      this.showingDeleteDialog = false
    },
    pinStatus () {
      this.$store.dispatch('pinStatus', this.status.id)
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    unpinStatus () {
      this.$store.dispatch('unpinStatus', this.status.id)
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    muteConversation () {
      this.$store.dispatch('muteConversation', this.status.id)
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    unmuteConversation () {
      this.$store.dispatch('unmuteConversation', this.status.id)
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    copyLink () {
      navigator.clipboard.writeText(this.statusLink)
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    bookmarkStatus () {
      this.$store.dispatch('bookmark', { id: this.status.id })
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    unbookmarkStatus () {
      this.$store.dispatch('unbookmark', { id: this.status.id })
        .then(() => this.$emit('onSuccess'))
        .catch(err => this.$emit('onError', err.error.error))
    },
    reportStatus () {
      this.$store.dispatch('openUserReportingModal', { userId: this.status.user.id, statusIds: [this.status.id] })
    },
    editStatus () {
      this.$store.dispatch('fetchStatusSource', { id: this.status.id })
        .then(data => this.$store.dispatch('openEditStatusModal', {
          statusId: this.status.id,
          subject: data.spoiler_text,
          statusText: data.text,
          statusIsSensitive: this.status.nsfw,
          statusPoll: this.status.poll,
          statusFiles: [...this.status.attachments],
          visibility: this.status.visibility,
          statusContentType: data.content_type
        }))
    },
    showStatusHistory () {
      const originalStatus = { ...this.status }
      const stripFieldsList = ['attachments', 'created_at', 'emojis', 'text', 'raw_html', 'nsfw', 'poll', 'summary', 'summary_raw_html']
      stripFieldsList.forEach(p => delete originalStatus[p])
      this.$store.dispatch('openStatusHistoryModal', originalStatus)
    }
  },
  computed: {
    currentUser () { return this.$store.state.users.currentUser },
    canDelete () {
      if (!this.currentUser) { return }
      return this.currentUser.privileges.includes('messages_delete') || this.status.user.id === this.currentUser.id
    },
    ownStatus () {
      return this.status.user.id === this.currentUser.id
    },
    canPin () {
      return this.ownStatus && (this.status.visibility === 'public' || this.status.visibility === 'unlisted')
    },
    canMute () {
      return !!this.currentUser
    },
    canBookmark () {
      return !!this.currentUser
    },
    statusLink () {
      return `${this.$store.state.instance.server}${this.$router.resolve({ name: 'conversation', params: { id: this.status.id } }).href}`
    },
    isEdited () {
      return this.status.edited_at !== null
    },
    editingAvailable () { return this.$store.state.instance.editingAvailable },
    shouldConfirmDelete () {
      return this.$store.getters.mergedConfig.modalOnDelete
    },
    triggerAttrs () {
      return {
        title: this.$t('status.more_actions'),
        id: `popup-trigger-${this.randomSeed}`,
        'aria-controls': `popup-menu-${this.randomSeed}`,
        'aria-expanded': this.expanded,
        'aria-haspopup': 'menu'
      }
    }
  }
}

export default ExtraButtons
