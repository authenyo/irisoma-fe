import Cookies from 'js-cookie'
import { setPreset, applyTheme, applyConfig } from '../services/style_setter/style_setter.js'
import messages from '../i18n/messages'
import { set } from 'lodash'
import localeService from '../services/locale/locale.service.js'

const BACKEND_LANGUAGE_COOKIE_NAME = 'userLanguage'

const browserLocale = (window.navigator.language || 'en').split('-')[0]

/* TODO this is a bit messy.
 * We need to declare settings with their types and also deal with
 * instance-default settings in some way, hopefully try to avoid copy-pasta
 * in general.
 */
export const multiChoiceProperties = [
  'postContentType',
  'subjectLineBehavior',
  'conversationDisplay', // tree | linear
  'conversationOtherRepliesButton', // below | inside
  'mentionLinkDisplay', // short | full_for_remote | full
  'userPopoverAvatarAction' // close | zoom | open
]

export const defaultState = {
  expertLevel: 0, // used to track which settings to show and hide
  colors: {},
  theme: undefined,
  customTheme: undefined,
  customThemeSource: undefined,
  hideISP: false,
  hideInstanceWallpaper: false,
  hideShoutbox: false,
  // bad name: actually hides posts of muted USERS
  hideMutedPosts: undefined, // instance default
  hideMutedThreads: undefined, // instance default
  hideWordFilteredPosts: undefined, // instance default
  muteBotStatuses: undefined, // instance default
  collapseMessageWithSubject: undefined, // instance default
  padEmoji: true,
  hideAttachments: false,
  hideAttachmentsInConv: false,
  maxThumbnails: 16,
  hideNsfw: true,
  preloadImage: true,
  loopVideo: true,
  loopVideoSilentOnly: true,
  streaming: false,
  emojiReactionsOnTimeline: true,
  alwaysShowNewPostButton: false,
  autohideFloatingPostButton: false,
  pauseOnUnfocused: true,
  stopGifs: true,
  replyVisibility: 'all',
  thirdColumnMode: 'notifications',
  notificationVisibility: {
    follows: true,
    mentions: true,
    likes: true,
    repeats: true,
    moves: true,
    emojiReactions: true,
    followRequest: true,
    reports: true,
    chatMention: true,
    polls: true
  },
  webPushNotifications: false,
  muteWords: [],
  highlight: {},
  interfaceLanguage: browserLocale,
  hideScopeNotice: false,
  useStreamingApi: false,
  sidebarRight: undefined, // instance default
  scopeCopy: undefined, // instance default
  subjectLineBehavior: undefined, // instance default
  alwaysShowSubjectInput: undefined, // instance default
  postContentType: undefined, // instance default
  minimalScopesMode: undefined, // instance default
  // This hides statuses filtered via a word filter
  hideFilteredStatuses: undefined, // instance default
  modalOnRepeat: undefined, // instance default
  modalOnUnfollow: undefined, // instance default
  modalOnBlock: undefined, // instance default
  modalOnMute: undefined, // instance default
  modalOnDelete: undefined, // instance default
  modalOnLogout: undefined, // instance default
  modalOnApproveFollow: undefined, // instance default
  modalOnDenyFollow: undefined, // instance default
  modalOnRemoveUserFromFollowers: undefined, // instance default
  playVideosInModal: false,
  useOneClickNsfw: false,
  useContainFit: true,
  disableStickyHeaders: false,
  showScrollbars: false,
  userPopoverAvatarAction: 'open',
  userPopoverOverlay: false,
  sidebarColumnWidth: '25rem',
  contentColumnWidth: '45rem',
  notifsColumnWidth: '25rem',
  emojiReactionsScale: 1.0,
  navbarColumnStretch: false,
  greentext: undefined, // instance default
  useAtIcon: undefined, // instance default
  mentionLinkDisplay: undefined, // instance default
  mentionLinkShowTooltip: undefined, // instance default
  mentionLinkShowAvatar: undefined, // instance default
  mentionLinkFadeDomain: undefined, // instance default
  mentionLinkShowYous: undefined, // instance default
  mentionLinkBoldenYou: undefined, // instance default
  hidePostStats: undefined, // instance default
  hideBotIndication: undefined, // instance default
  hideUserStats: undefined, // instance default
  virtualScrolling: undefined, // instance default
  sensitiveByDefault: undefined, // instance default
  conversationDisplay: undefined, // instance default
  conversationTreeAdvanced: undefined, // instance default
  conversationOtherRepliesButton: undefined, // instance default
  conversationTreeFadeAncestors: undefined, // instance default
  maxDepthInThread: undefined, // instance default
  autocompleteSelect: undefined // instance default
}

// caching the instance default properties
export const instanceDefaultProperties = Object.entries(defaultState)
  .filter(([key, value]) => value === undefined)
  .map(([key, value]) => key)

const config = {
  state: { ...defaultState },
  getters: {
    defaultConfig (state, getters, rootState, rootGetters) {
      const { instance } = rootState
      return {
        ...defaultState,
        ...Object.fromEntries(
          instanceDefaultProperties.map(key => [key, instance[key]])
        )
      }
    },
    mergedConfig (state, getters, rootState, rootGetters) {
      const { defaultConfig } = rootGetters
      return {
        ...defaultConfig,
        // Do not override with undefined
        ...Object.fromEntries(Object.entries(state).filter(([k, v]) => v !== undefined))
      }
    }
  },
  mutations: {
    setOption (state, { name, value }) {
      set(state, name, value)
    },
    setHighlight (state, { user, color, type }) {
      const data = this.state.config.highlight[user]
      if (color || type) {
        state.highlight[user] = { color: color || data.color, type: type || data.type }
      } else {
        delete state.highlight[user]
      }
    }
  },
  actions: {
    loadSettings ({ dispatch }, data) {
      const knownKeys = new Set(Object.keys(defaultState))
      const presentKeys = new Set(Object.keys(data))
      const intersection = new Set()
      for (const elem of presentKeys) {
        if (knownKeys.has(elem)) {
          intersection.add(elem)
        }
      }

      intersection.forEach(
        name => dispatch('setOption', { name, value: data[name] })
      )
    },
    setHighlight ({ commit, dispatch }, { user, color, type }) {
      commit('setHighlight', { user, color, type })
    },
    setOption ({ commit, dispatch, state }, { name, value }) {
      const exceptions = new Set([
        'useStreamingApi'
      ])

      if (exceptions.has(name)) {
        switch (name) {
          case 'useStreamingApi': {
            const action = value ? 'enableMastoSockets' : 'disableMastoSockets'

            dispatch(action).then(() => {
              commit('setOption', { name: 'useStreamingApi', value })
            }).catch((e) => {
              console.error('Failed starting MastoAPI Streaming socket', e)
              dispatch('disableMastoSockets')
              dispatch('setOption', { name: 'useStreamingApi', value: false })
            })
          }
        }
      } else {
        commit('setOption', { name, value })
        switch (name) {
          case 'theme':
            setPreset(value)
            break
          case 'sidebarColumnWidth':
          case 'contentColumnWidth':
          case 'notifsColumnWidth':
          case 'emojiReactionsScale':
            applyConfig(state)
            break
          case 'customTheme':
          case 'customThemeSource':
            applyTheme(value)
            break
          case 'interfaceLanguage':
            messages.setLanguage(this.getters.i18n, value)
            dispatch('loadUnicodeEmojiData', value)
            Cookies.set(
              BACKEND_LANGUAGE_COOKIE_NAME,
              localeService.internalToBackendLocaleMulti(value)
            )
            break
          case 'thirdColumnMode':
            dispatch('setLayoutWidth', undefined)
            break
        }
      }
    }
  }
}

export default config
