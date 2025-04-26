import { mapState } from 'vuex'
import { routeTo } from 'src/components/navigation/navigation.js'
import OptionalRouterLink from 'src/components/optional_router_link/optional_router_link.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faThumbtack } from '@fortawesome/free-solid-svg-icons'

library.add(faThumbtack)

const NavigationEntry = {
  props: ['item', 'showPin'],
  components: {
    OptionalRouterLink
  },
  methods: {
    isPinned (value) {
      return this.pinnedItems.has(value)
    },
    togglePin (value) {
      if (this.isPinned(value)) {
        this.$store.commit('removeCollectionPreference', { path: 'collections.pinnedNavItems', value })
      } else {
        this.$store.commit('addCollectionPreference', { path: 'collections.pinnedNavItems', value })
      }
      this.$store.dispatch('pushServerSideStorage')
    }
  },
  computed: {
    routeTo () {
      return routeTo(this.item, this.currentUser)
    },
    getters () {
      return this.$store.getters
    },
    ...mapState({
      currentUser: state => state.users.currentUser,
      pinnedItems: state => new Set(state.serverSideStorage.prefsStorage.collections.pinnedNavItems)
    })
  }
}

export default NavigationEntry
