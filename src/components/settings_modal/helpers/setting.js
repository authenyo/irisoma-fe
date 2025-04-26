import ModifiedIndicator from './modified_indicator.vue'
import ProfileSettingIndicator from './profile_setting_indicator.vue'
import DraftButtons from './draft_buttons.vue'
import { get, set, cloneDeep } from 'lodash'

export default {
  components: {
    ModifiedIndicator,
    DraftButtons,
    ProfileSettingIndicator
  },
  props: {
    path: {
      type: [String, Array],
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    parentPath: {
      type: [String, Array]
    },
    parentInvert: {
      type: Boolean,
      default: false
    },
    expert: {
      type: [Number, String],
      default: 0
    },
    source: {
      type: String,
      default: undefined
    },
    hideDescription: {
      type: Boolean
    },
    swapDescriptionAndLabel: {
      type: Boolean
    },
    overrideBackendDescription: {
      type: Boolean
    },
    overrideBackendDescriptionLabel: {
      type: Boolean
    },
    draftMode: {
      type: Boolean,
      default: undefined
    }
  },
  inject: {
    defaultSource: {
      default: 'default'
    },
    defaultDraftMode: {
      default: false
    }
  },
  data () {
    return {
      localDraft: null
    }
  },
  created () {
    if (this.realDraftMode && this.realSource !== 'admin') {
      this.draft = this.state
    }
  },
  computed: {
    draft: {
      // TODO allow passing shared draft object?
      get () {
        if (this.realSource === 'admin') {
          return get(this.$store.state.adminSettings.draft, this.canonPath)
        } else {
          return this.localDraft
        }
      },
      set (value) {
        if (this.realSource === 'admin') {
          this.$store.commit('updateAdminDraft', { path: this.canonPath, value })
        } else {
          this.localDraft = value
        }
      }
    },
    state () {
      const value = get(this.configSource, this.canonPath)
      if (value === undefined) {
        return this.defaultState
      } else {
        return value
      }
    },
    visibleState () {
      return this.realDraftMode ? this.draft : this.state
    },
    realSource () {
      return this.source || this.defaultSource
    },
    realDraftMode () {
      return typeof this.draftMode === 'undefined' ? this.defaultDraftMode : this.draftMode
    },
    backendDescription () {
      return get(this.$store.state.adminSettings.descriptions, this.path)
    },
    backendDescriptionLabel () {
      if (this.realSource !== 'admin') return ''
      if (!this.backendDescription || this.overrideBackendDescriptionLabel) {
        return this.$t([
          'admin_dash',
          'temp_overrides',
          ...this.canonPath.map(p => p.replace(/\./g, '_DOT_')),
          'label'
        ].join('.'))
      } else {
        return this.swapDescriptionAndLabel
          ? this.backendDescription?.description
          : this.backendDescription?.label
      }
    },
    backendDescriptionDescription () {
      if (this.realSource !== 'admin') return ''
      if (this.hideDescription) return null
      if (!this.backendDescription || this.overrideBackendDescription) {
        return this.$t([
          'admin_dash',
          'temp_overrides',
          ...this.canonPath.map(p => p.replace(/\./g, '_DOT_')),
          'description'
        ].join('.'))
      } else {
        return this.swapDescriptionAndLabel
          ? this.backendDescription?.label
          : this.backendDescription?.description
      }
    },
    backendDescriptionSuggestions () {
      return this.backendDescription?.suggestions
    },
    shouldBeDisabled () {
      const parentValue = this.parentPath !== undefined ? get(this.configSource, this.parentPath) : null
      return this.disabled || (parentValue !== null ? (this.parentInvert ? parentValue : !parentValue) : false)
    },
    configSource () {
      switch (this.realSource) {
        case 'profile':
          return this.$store.state.profileConfig
        case 'admin':
          return this.$store.state.adminSettings.config
        default:
          return this.$store.getters.mergedConfig
      }
    },
    configSink () {
      switch (this.realSource) {
        case 'profile':
          return (k, v) => this.$store.dispatch('setProfileOption', { name: k, value: v })
        case 'admin':
          return (k, v) => this.$store.dispatch('pushAdminSetting', { path: k, value: v })
        default:
          return (k, v) => this.$store.dispatch('setOption', { name: k, value: v })
      }
    },
    defaultState () {
      switch (this.realSource) {
        case 'profile':
          return {}
        default:
          return get(this.$store.getters.defaultConfig, this.path)
      }
    },
    isProfileSetting () {
      return this.realSource === 'profile'
    },
    isChanged () {
      switch (this.realSource) {
        case 'profile':
        case 'admin':
          return false
        default:
          return this.state !== this.defaultState
      }
    },
    canonPath () {
      return Array.isArray(this.path) ? this.path : this.path.split('.')
    },
    isDirty () {
      if (this.realSource === 'admin' && this.canonPath.length > 3) {
        return false // should not show draft buttons for "grouped" values
      } else {
        return this.realDraftMode && this.draft !== this.state
      }
    },
    canHardReset () {
      return this.realSource === 'admin' && this.$store.state.adminSettings.modifiedPaths.has(this.canonPath.join(' -> '))
    },
    matchesExpertLevel () {
      return (this.expert || 0) <= this.$store.state.config.expertLevel > 0
    }
  },
  methods: {
    getValue (e) {
      return e.target.value
    },
    update (e) {
      if (this.realDraftMode) {
        this.draft = this.getValue(e)
      } else {
        this.configSink(this.path, this.getValue(e))
      }
    },
    commitDraft () {
      if (this.realDraftMode) {
        this.configSink(this.path, this.draft)
      }
    },
    reset () {
      if (this.realDraftMode) {
        this.draft = cloneDeep(this.state)
      } else {
        set(this.$store.getters.mergedConfig, this.path, cloneDeep(this.defaultState))
      }
    },
    hardReset () {
      switch (this.realSource) {
        case 'admin':
          return this.$store.dispatch('resetAdminSetting', { path: this.path })
            .then(() => { this.draft = this.state })
        default:
          console.warn('Hard reset not implemented yet!')
      }
    }
  }
}
