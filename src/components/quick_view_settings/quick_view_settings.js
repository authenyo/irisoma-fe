import Popover from '../popover/popover.vue'
import { mapGetters } from 'vuex'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faList, faFolderTree, faBars, faWrench } from '@fortawesome/free-solid-svg-icons'

library.add(
  faList,
  faFolderTree,
  faBars,
  faWrench
)

const QuickViewSettings = {
  props: {
    conversation: Boolean
  },
  components: {
    Popover
  },
  methods: {
    setConversationDisplay (visibility) {
      this.$store.dispatch('setOption', { name: 'conversationDisplay', value: visibility })
    },
    openTab (tab) {
      this.$store.dispatch('openSettingsModalTab', tab)
    }
  },
  computed: {
    ...mapGetters(['mergedConfig']),
    loggedIn () {
      return !!this.$store.state.users.currentUser
    },
    conversationDisplay: {
      get () { return this.mergedConfig.conversationDisplay },
      set (newVal) { this.setConversationDisplay(newVal) }
    },
    autoUpdate: {
      get () { return this.mergedConfig.streaming },
      set () {
        const value = !this.autoUpdate
        this.$store.dispatch('setOption', { name: 'streaming', value })
      }
    },
    collapseWithSubjects: {
      get () { return this.mergedConfig.collapseMessageWithSubject },
      set () {
        const value = !this.collapseWithSubjects
        this.$store.dispatch('setOption', { name: 'collapseMessageWithSubject', value })
      }
    },
    showUserAvatars: {
      get () { return this.mergedConfig.mentionLinkShowAvatar },
      set () {
        const value = !this.showUserAvatars
        console.log(value)
        this.$store.dispatch('setOption', { name: 'mentionLinkShowAvatar', value })
      }
    },
    muteBotStatuses: {
      get () { return this.mergedConfig.muteBotStatuses },
      set () {
        const value = !this.muteBotStatuses
        this.$store.dispatch('setOption', { name: 'muteBotStatuses', value })
      }
    }
  }
}

export default QuickViewSettings
