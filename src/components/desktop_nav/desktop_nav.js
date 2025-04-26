import SearchBar from 'components/search_bar/search_bar.vue'
import ConfirmModal from '../confirm_modal/confirm_modal.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faSignInAlt,
  faSignOutAlt,
  faHome,
  faComments,
  faBell,
  faUserPlus,
  faBullhorn,
  faSearch,
  faTachometerAlt,
  faCog,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faSignInAlt,
  faSignOutAlt,
  faHome,
  faComments,
  faBell,
  faUserPlus,
  faBullhorn,
  faSearch,
  faTachometerAlt,
  faCog,
  faInfoCircle
)

export default {
  components: {
    SearchBar,
    ConfirmModal
  },
  data: () => ({
    searchBarHidden: true,
    supportsMask: window.CSS && window.CSS.supports && (
      window.CSS.supports('mask-size', 'contain') ||
        window.CSS.supports('-webkit-mask-size', 'contain') ||
        window.CSS.supports('-moz-mask-size', 'contain') ||
        window.CSS.supports('-ms-mask-size', 'contain') ||
        window.CSS.supports('-o-mask-size', 'contain')
    ),
    showingConfirmLogout: false
  }),
  computed: {
    enableMask () { return this.supportsMask && this.$store.state.instance.logoMask },
    logoStyle () {
      return {
        visibility: this.enableMask ? 'hidden' : 'visible'
      }
    },
    logoMaskStyle () {
      return this.enableMask
        ? {
            'mask-image': `url(${this.$store.state.instance.logo})`
          }
        : {
            'background-color': this.enableMask ? '' : 'transparent'
          }
    },
    logoBgStyle () {
      return Object.assign({
        margin: `${this.$store.state.instance.logoMargin} 0`,
        opacity: this.searchBarHidden ? 1 : 0
      }, this.enableMask
        ? {}
        : {
            'background-color': this.enableMask ? '' : 'transparent'
          })
    },
    logo () { return this.$store.state.instance.logo },
    sitename () { return this.$store.state.instance.name },
    hideSitename () { return this.$store.state.instance.hideSitename },
    logoLeft () { return this.$store.state.instance.logoLeft },
    currentUser () { return this.$store.state.users.currentUser },
    privateMode () { return this.$store.state.instance.private },
    shouldConfirmLogout () {
      return this.$store.getters.mergedConfig.modalOnLogout
    }
  },
  methods: {
    scrollToTop () {
      window.scrollTo(0, 0)
    },
    showConfirmLogout () {
      this.showingConfirmLogout = true
    },
    hideConfirmLogout () {
      this.showingConfirmLogout = false
    },
    logout () {
      if (!this.shouldConfirmLogout) {
        this.doLogout()
      } else {
        this.showConfirmLogout()
      }
    },
    doLogout () {
      this.$router.replace('/main/public')
      this.$store.dispatch('logout')
      this.hideConfirmLogout()
    },
    onSearchBarToggled (hidden) {
      this.searchBarHidden = hidden
    },
    openSettingsModal () {
      this.$store.dispatch('openSettingsModal', 'user')
    },
    openAdminModal () {
      this.$store.dispatch('openSettingsModal', 'admin')
    }
  }
}
