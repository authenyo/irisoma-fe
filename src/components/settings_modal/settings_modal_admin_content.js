import TabSwitcher from 'src/components/tab_switcher/tab_switcher.jsx'

import InstanceTab from './admin_tabs/instance_tab.vue'
import LimitsTab from './admin_tabs/limits_tab.vue'
import FrontendsTab from './admin_tabs/frontends_tab.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faWrench,
  faHand,
  faLaptopCode,
  faPaintBrush,
  faBell,
  faDownload,
  faEyeSlash,
  faInfo
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faWrench,
  faHand,
  faLaptopCode,
  faPaintBrush,
  faBell,
  faDownload,
  faEyeSlash,
  faInfo
)

const SettingsModalAdminContent = {
  components: {
    TabSwitcher,

    InstanceTab,
    LimitsTab,
    FrontendsTab
  },
  computed: {
    user () {
      return this.$store.state.users.currentUser
    },
    isLoggedIn () {
      return !!this.$store.state.users.currentUser
    },
    open () {
      return this.$store.state.interface.settingsModalState !== 'hidden'
    },
    bodyLock () {
      return this.$store.state.interface.settingsModalState === 'visible'
    },
    adminDbLoaded () {
      return this.$store.state.adminSettings.loaded
    },
    adminDescriptionsLoaded () {
      return this.$store.state.adminSettings.descriptions !== null
    },
    noDb () {
      return this.$store.state.adminSettings.dbConfigEnabled === false
    }
  },
  created () {
    if (this.user.rights.admin) {
      this.$store.dispatch('loadAdminStuff')
    }
  },
  methods: {
    onOpen () {
      const targetTab = this.$store.state.interface.settingsModalTargetTab
      // We're being told to open in specific tab
      if (targetTab) {
        const tabIndex = this.$refs.tabSwitcher.$slots.default().findIndex(elm => {
          return elm.props && elm.props['data-tab-name'] === targetTab
        })
        if (tabIndex >= 0) {
          this.$refs.tabSwitcher.setTab(tabIndex)
        }
      }
      // Clear the state of target tab, so that next time settings is opened
      // it doesn't force it.
      this.$store.dispatch('clearSettingsModalTargetTab')
    }
  },
  mounted () {
    this.onOpen()
  },
  watch: {
    open: function (value) {
      if (value) this.onOpen()
    }
  }
}

export default SettingsModalAdminContent
