import { mapState } from 'vuex'
import { TIMELINES, ROOT_ITEMS, routeTo } from 'src/components/navigation/navigation.js'
import { getListEntries, filterNavigation } from 'src/components/navigation/filter.js'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faUsers,
  faGlobe,
  faBookmark,
  faEnvelope,
  faComments,
  faBell,
  faInfoCircle,
  faStream,
  faList
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faUsers,
  faGlobe,
  faBookmark,
  faEnvelope,
  faComments,
  faBell,
  faInfoCircle,
  faStream,
  faList
)

const NavPanel = {
  props: ['limit'],
  methods: {
    getRouteTo (item) {
      return routeTo(item, this.currentUser)
    }
  },
  computed: {
    getters () {
      return this.$store.getters
    },
    ...mapState({
      lists: getListEntries,
      currentUser: state => state.users.currentUser,
      followRequestCount: state => state.api.followRequests.length,
      privateMode: state => state.instance.private,
      federating: state => state.instance.federating,
      pleromaChatMessagesAvailable: state => state.instance.pleromaChatMessagesAvailable,
      supportsAnnouncements: state => state.announcements.supportsAnnouncements,
      pinnedItems: state => new Set(state.serverSideStorage.prefsStorage.collections.pinnedNavItems)
    }),
    pinnedList () {
      if (!this.currentUser) {
        return filterNavigation([
          { ...TIMELINES.public, name: 'public' },
          { ...TIMELINES.twkn, name: 'twkn' },
          { ...ROOT_ITEMS.about, name: 'about' }
        ],
        {
          hasChats: this.pleromaChatMessagesAvailable,
          hasAnnouncements: this.supportsAnnouncements,
          isFederating: this.federating,
          isPrivate: this.privateMode,
          currentUser: this.currentUser
        })
      }
      return filterNavigation(
        [
          ...Object
            .entries({ ...TIMELINES })
            .filter(([k]) => this.pinnedItems.has(k))
            .map(([k, v]) => ({ ...v, name: k })),
          ...this.lists.filter((k) => this.pinnedItems.has(k.name)),
          ...Object
            .entries({ ...ROOT_ITEMS })
            .filter(([k]) => this.pinnedItems.has(k))
            .map(([k, v]) => ({ ...v, name: k }))
        ],
        {
          hasChats: this.pleromaChatMessagesAvailable,
          hasAnnouncements: this.supportsAnnouncements,
          isFederating: this.federating,
          isPrivate: this.privateMode,
          currentUser: this.currentUser
        }
      ).slice(0, this.limit)
    }
  }
}

export default NavPanel
