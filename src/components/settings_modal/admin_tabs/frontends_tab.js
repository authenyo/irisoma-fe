import BooleanSetting from '../helpers/boolean_setting.vue'
import ChoiceSetting from '../helpers/choice_setting.vue'
import IntegerSetting from '../helpers/integer_setting.vue'
import StringSetting from '../helpers/string_setting.vue'
import GroupSetting from '../helpers/group_setting.vue'
import Popover from 'src/components/popover/popover.vue'
import PanelLoading from 'src/components/panel_loading/panel_loading.vue'

import SharedComputedObject from '../helpers/shared_computed_object.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faGlobe
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faGlobe
)

const FrontendsTab = {
  provide () {
    return {
      defaultDraftMode: true,
      defaultSource: 'admin'
    }
  },
  data () {
    return {
      working: false
    }
  },
  components: {
    BooleanSetting,
    ChoiceSetting,
    IntegerSetting,
    StringSetting,
    GroupSetting,
    PanelLoading,
    Popover
  },
  created () {
    if (this.user.rights.admin) {
      this.$store.dispatch('loadFrontendsStuff')
    }
  },
  computed: {
    frontends () {
      return this.$store.state.adminSettings.frontends
    },
    ...SharedComputedObject()
  },
  methods: {
    canInstall (frontend) {
      const fe = this.frontends.find(f => f.name === frontend.name)
      if (!fe) return false
      return fe.refs.includes(frontend.ref)
    },
    getSuggestedRef (frontend) {
      const defaultFe = this.adminDraft[':pleroma'][':frontends'][':primary']
      if (defaultFe?.name === frontend.name && this.canInstall(defaultFe)) {
        return defaultFe.ref
      } else {
        return frontend.refs[0]
      }
    },
    update (frontend, suggestRef) {
      const ref = suggestRef || this.getSuggestedRef(frontend)
      const { name } = frontend
      const payload = { name, ref }

      this.working = true
      this.$store.state.api.backendInteractor.installFrontend({ payload })
        .finally(() => {
          this.working = false
        })
        .then(async (response) => {
          this.$store.dispatch('loadFrontendsStuff')
          if (response.error) {
            const reason = await response.error.json()
            this.$store.dispatch('pushGlobalNotice', {
              level: 'error',
              messageKey: 'admin_dash.frontend.failure_installing_frontend',
              messageArgs: {
                version: name + '/' + ref,
                reason: reason.error
              },
              timeout: 5000
            })
          } else {
            this.$store.dispatch('pushGlobalNotice', {
              level: 'success',
              messageKey: 'admin_dash.frontend.success_installing_frontend',
              messageArgs: {
                version: name + '/' + ref
              },
              timeout: 2000
            })
          }
        })
    },
    setDefault (frontend, suggestRef) {
      const ref = suggestRef || this.getSuggestedRef(frontend)
      const { name } = frontend

      this.$store.commit('updateAdminDraft', { path: [':pleroma', ':frontends', ':primary'], value: { name, ref } })
    }
  }
}

export default FrontendsTab
