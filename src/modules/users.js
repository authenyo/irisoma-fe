import backendInteractorService from '../services/backend_interactor_service/backend_interactor_service.js'
import { windowWidth, windowHeight } from '../services/window_utils/window_utils'
import oauthApi from '../services/new_api/oauth.js'
import { compact, map, each, mergeWith, last, concat, uniq, isArray } from 'lodash'
import { registerPushNotifications, unregisterPushNotifications } from '../services/push/push.js'

// TODO: Unify with mergeOrAdd in statuses.js
export const mergeOrAdd = (arr, obj, item) => {
  if (!item) { return false }
  const oldItem = obj[item.id]
  if (oldItem) {
    // We already have this, so only merge the new info.
    mergeWith(oldItem, item, mergeArrayLength)
    return { item: oldItem, new: false }
  } else {
    // This is a new item, prepare it
    arr.push(item)
    obj[item.id] = item
    return { item, new: true }
  }
}

const mergeArrayLength = (oldValue, newValue) => {
  if (isArray(oldValue) && isArray(newValue)) {
    oldValue.length = newValue.length
    return mergeWith(oldValue, newValue, mergeArrayLength)
  }
}

const getNotificationPermission = () => {
  const Notification = window.Notification

  if (!Notification) return Promise.resolve(null)
  if (Notification.permission === 'default') return Notification.requestPermission()
  return Promise.resolve(Notification.permission)
}

const blockUser = (store, id) => {
  return store.rootState.api.backendInteractor.blockUser({ id })
    .then((relationship) => {
      store.commit('updateUserRelationship', [relationship])
      store.commit('addBlockId', id)
      store.commit('removeStatus', { timeline: 'friends', userId: id })
      store.commit('removeStatus', { timeline: 'public', userId: id })
      store.commit('removeStatus', { timeline: 'publicAndExternal', userId: id })
    })
}

const unblockUser = (store, id) => {
  return store.rootState.api.backendInteractor.unblockUser({ id })
    .then((relationship) => store.commit('updateUserRelationship', [relationship]))
}

const removeUserFromFollowers = (store, id) => {
  return store.rootState.api.backendInteractor.removeUserFromFollowers({ id })
    .then((relationship) => store.commit('updateUserRelationship', [relationship]))
}

const editUserNote = (store, { id, comment }) => {
  return store.rootState.api.backendInteractor.editUserNote({ id, comment })
    .then((relationship) => store.commit('updateUserRelationship', [relationship]))
}

const muteUser = (store, args) => {
  const id = typeof args === 'object' ? args.id : args
  const expiresIn = typeof args === 'object' ? args.expiresIn : 0

  const predictedRelationship = store.state.relationships[id] || { id }
  predictedRelationship.muting = true
  store.commit('updateUserRelationship', [predictedRelationship])
  store.commit('addMuteId', id)

  return store.rootState.api.backendInteractor.muteUser({ id, expiresIn })
    .then((relationship) => {
      store.commit('updateUserRelationship', [relationship])
      store.commit('addMuteId', id)
    })
}

const unmuteUser = (store, id) => {
  const predictedRelationship = store.state.relationships[id] || { id }
  predictedRelationship.muting = false
  store.commit('updateUserRelationship', [predictedRelationship])

  return store.rootState.api.backendInteractor.unmuteUser({ id })
    .then((relationship) => store.commit('updateUserRelationship', [relationship]))
}

const hideReblogs = (store, userId) => {
  return store.rootState.api.backendInteractor.followUser({ id: userId, reblogs: false })
    .then((relationship) => {
      store.commit('updateUserRelationship', [relationship])
    })
}

const showReblogs = (store, userId) => {
  return store.rootState.api.backendInteractor.followUser({ id: userId, reblogs: true })
    .then((relationship) => store.commit('updateUserRelationship', [relationship]))
}

const muteDomain = (store, domain) => {
  return store.rootState.api.backendInteractor.muteDomain({ domain })
    .then(() => store.commit('addDomainMute', domain))
}

const unmuteDomain = (store, domain) => {
  return store.rootState.api.backendInteractor.unmuteDomain({ domain })
    .then(() => store.commit('removeDomainMute', domain))
}

export const mutations = {
  tagUser (state, { user: { id }, tag }) {
    const user = state.usersObject[id]
    const tags = user.tags || []
    const newTags = tags.concat([tag])
    user.tags = newTags
  },
  untagUser (state, { user: { id }, tag }) {
    const user = state.usersObject[id]
    const tags = user.tags || []
    const newTags = tags.filter(t => t !== tag)
    user.tags = newTags
  },
  updateRight (state, { user: { id }, right, value }) {
    const user = state.usersObject[id]
    const newRights = user.rights
    newRights[right] = value
    user.rights = newRights
  },
  updateActivationStatus (state, { user: { id }, deactivated }) {
    const user = state.usersObject[id]
    user.deactivated = deactivated
  },
  setCurrentUser (state, user) {
    state.lastLoginName = user.screen_name
    state.currentUser = mergeWith(state.currentUser || {}, user, mergeArrayLength)
  },
  clearCurrentUser (state) {
    state.currentUser = false
    state.lastLoginName = false
  },
  beginLogin (state) {
    state.loggingIn = true
  },
  endLogin (state) {
    state.loggingIn = false
  },
  saveFriendIds (state, { id, friendIds }) {
    const user = state.usersObject[id]
    user.friendIds = uniq(concat(user.friendIds || [], friendIds))
  },
  saveFollowerIds (state, { id, followerIds }) {
    const user = state.usersObject[id]
    user.followerIds = uniq(concat(user.followerIds || [], followerIds))
  },
  // Because frontend doesn't have a reason to keep these stuff in memory
  // outside of viewing someones user profile.
  clearFriends (state, userId) {
    const user = state.usersObject[userId]
    if (user) {
      user.friendIds = []
    }
  },
  clearFollowers (state, userId) {
    const user = state.usersObject[userId]
    if (user) {
      user.followerIds = []
    }
  },
  addNewUsers (state, users) {
    each(users, (user) => {
      if (user.relationship) {
        state.relationships[user.relationship.id] = user.relationship
      }
      const res = mergeOrAdd(state.users, state.usersObject, user)
      const item = res.item
      if (res.new && item.screen_name && !item.screen_name.includes('@')) {
        state.usersByNameObject[item.screen_name.toLowerCase()] = item
      }
    })
  },
  updateUserRelationship (state, relationships) {
    relationships.forEach((relationship) => {
      state.relationships[relationship.id] = relationship
    })
  },
  updateUserInLists (state, { id, inLists }) {
    state.usersObject[id].inLists = inLists
  },
  saveBlockIds (state, blockIds) {
    state.currentUser.blockIds = blockIds
  },
  addBlockId (state, blockId) {
    if (state.currentUser.blockIds.indexOf(blockId) === -1) {
      state.currentUser.blockIds.push(blockId)
    }
  },
  setBlockIdsMaxId (state, blockIdsMaxId) {
    state.currentUser.blockIdsMaxId = blockIdsMaxId
  },
  saveMuteIds (state, muteIds) {
    state.currentUser.muteIds = muteIds
  },
  setMuteIdsMaxId (state, muteIdsMaxId) {
    state.currentUser.muteIdsMaxId = muteIdsMaxId
  },
  addMuteId (state, muteId) {
    if (state.currentUser.muteIds.indexOf(muteId) === -1) {
      state.currentUser.muteIds.push(muteId)
    }
  },
  saveDomainMutes (state, domainMutes) {
    state.currentUser.domainMutes = domainMutes
  },
  addDomainMute (state, domain) {
    if (state.currentUser.domainMutes.indexOf(domain) === -1) {
      state.currentUser.domainMutes.push(domain)
    }
  },
  removeDomainMute (state, domain) {
    const index = state.currentUser.domainMutes.indexOf(domain)
    if (index !== -1) {
      state.currentUser.domainMutes.splice(index, 1)
    }
  },
  setPinnedToUser (state, status) {
    const user = state.usersObject[status.user.id]
    user.pinnedStatusIds = user.pinnedStatusIds || []
    const index = user.pinnedStatusIds.indexOf(status.id)

    if (status.pinned && index === -1) {
      user.pinnedStatusIds.push(status.id)
    } else if (!status.pinned && index !== -1) {
      user.pinnedStatusIds.splice(index, 1)
    }
  },
  setUserForStatus (state, status) {
    status.user = state.usersObject[status.user.id]
  },
  setUserForNotification (state, notification) {
    if (notification.type !== 'follow') {
      notification.action.user = state.usersObject[notification.action.user.id]
    }
    notification.from_profile = state.usersObject[notification.from_profile.id]
  },
  setColor (state, { user: { id }, highlighted }) {
    const user = state.usersObject[id]
    user.highlight = highlighted
  },
  signUpPending (state) {
    state.signUpPending = true
    state.signUpErrors = []
  },
  signUpSuccess (state) {
    state.signUpPending = false
  },
  signUpFailure (state, errors) {
    state.signUpPending = false
    state.signUpErrors = errors
  }
}

export const getters = {
  findUser: state => query => {
    return state.usersObject[query]
  },
  findUserByName: state => query => {
    return state.usersByNameObject[query.toLowerCase()]
  },
  findUserByUrl: state => query => {
    return state.users
      .find(u => u.statusnet_profile_url &&
            u.statusnet_profile_url.toLowerCase() === query.toLowerCase())
  },
  relationship: state => id => {
    const rel = id && state.relationships[id]
    return rel || { id, loading: true }
  }
}

export const defaultState = {
  loggingIn: false,
  lastLoginName: false,
  currentUser: false,
  users: [],
  usersObject: {},
  usersByNameObject: {},
  signUpPending: false,
  signUpErrors: [],
  relationships: {}
}

const users = {
  state: defaultState,
  mutations,
  getters,
  actions: {
    fetchUserIfMissing (store, id) {
      if (!store.getters.findUser(id)) {
        store.dispatch('fetchUser', id)
      }
    },
    fetchUser (store, id) {
      return store.rootState.api.backendInteractor.fetchUser({ id })
        .then((user) => {
          store.commit('addNewUsers', [user])
          return user
        })
    },
    fetchUserByName (store, name) {
      return store.rootState.api.backendInteractor.fetchUserByName({ name })
        .then((user) => {
          store.commit('addNewUsers', [user])
          return user
        })
    },
    fetchUserRelationship (store, id) {
      if (store.state.currentUser) {
        store.rootState.api.backendInteractor.fetchUserRelationship({ id })
          .then((relationships) => store.commit('updateUserRelationship', relationships))
      }
    },
    fetchUserInLists (store, id) {
      if (store.state.currentUser) {
        store.rootState.api.backendInteractor.fetchUserInLists({ id })
          .then((inLists) => store.commit('updateUserInLists', { id, inLists }))
      }
    },
    fetchBlocks (store, args) {
      const { reset } = args || {}

      const maxId = store.state.currentUser.blockIdsMaxId
      return store.rootState.api.backendInteractor.fetchBlocks({ maxId })
        .then((blocks) => {
          if (reset) {
            store.commit('saveBlockIds', map(blocks, 'id'))
          } else {
            map(blocks, 'id').map(id => store.commit('addBlockId', id))
          }
          if (blocks.length) {
            store.commit('setBlockIdsMaxId', last(blocks).id)
          }
          store.commit('addNewUsers', blocks)
          return blocks
        })
    },
    blockUser (store, id) {
      return blockUser(store, id)
    },
    unblockUser (store, id) {
      return unblockUser(store, id)
    },
    removeUserFromFollowers (store, id) {
      return removeUserFromFollowers(store, id)
    },
    blockUsers (store, ids = []) {
      return Promise.all(ids.map(id => blockUser(store, id)))
    },
    unblockUsers (store, ids = []) {
      return Promise.all(ids.map(id => unblockUser(store, id)))
    },
    editUserNote (store, args) {
      return editUserNote(store, args)
    },
    fetchMutes (store, args) {
      const { reset } = args || {}

      const maxId = store.state.currentUser.muteIdsMaxId
      return store.rootState.api.backendInteractor.fetchMutes({ maxId })
        .then((mutes) => {
          if (reset) {
            store.commit('saveMuteIds', map(mutes, 'id'))
          } else {
            map(mutes, 'id').map(id => store.commit('addMuteId', id))
          }
          if (mutes.length) {
            store.commit('setMuteIdsMaxId', last(mutes).id)
          }
          store.commit('addNewUsers', mutes)
          return mutes
        })
    },
    muteUser (store, id) {
      return muteUser(store, id)
    },
    unmuteUser (store, id) {
      return unmuteUser(store, id)
    },
    hideReblogs (store, id) {
      return hideReblogs(store, id)
    },
    showReblogs (store, id) {
      return showReblogs(store, id)
    },
    muteUsers (store, ids = []) {
      return Promise.all(ids.map(id => muteUser(store, id)))
    },
    unmuteUsers (store, ids = []) {
      return Promise.all(ids.map(id => unmuteUser(store, id)))
    },
    fetchDomainMutes (store) {
      return store.rootState.api.backendInteractor.fetchDomainMutes()
        .then((domainMutes) => {
          store.commit('saveDomainMutes', domainMutes)
          return domainMutes
        })
    },
    muteDomain (store, domain) {
      return muteDomain(store, domain)
    },
    unmuteDomain (store, domain) {
      return unmuteDomain(store, domain)
    },
    muteDomains (store, domains = []) {
      return Promise.all(domains.map(domain => muteDomain(store, domain)))
    },
    unmuteDomains (store, domain = []) {
      return Promise.all(domain.map(domain => unmuteDomain(store, domain)))
    },
    fetchFriends ({ rootState, commit }, id) {
      const user = rootState.users.usersObject[id]
      const maxId = last(user.friendIds)
      return rootState.api.backendInteractor.fetchFriends({ id, maxId })
        .then((friends) => {
          commit('addNewUsers', friends)
          commit('saveFriendIds', { id, friendIds: map(friends, 'id') })
          return friends
        })
    },
    fetchFollowers ({ rootState, commit }, id) {
      const user = rootState.users.usersObject[id]
      const maxId = last(user.followerIds)
      return rootState.api.backendInteractor.fetchFollowers({ id, maxId })
        .then((followers) => {
          commit('addNewUsers', followers)
          commit('saveFollowerIds', { id, followerIds: map(followers, 'id') })
          return followers
        })
    },
    clearFriends ({ commit }, userId) {
      commit('clearFriends', userId)
    },
    clearFollowers ({ commit }, userId) {
      commit('clearFollowers', userId)
    },
    subscribeUser ({ rootState, commit }, id) {
      return rootState.api.backendInteractor.subscribeUser({ id })
        .then((relationship) => commit('updateUserRelationship', [relationship]))
    },
    unsubscribeUser ({ rootState, commit }, id) {
      return rootState.api.backendInteractor.unsubscribeUser({ id })
        .then((relationship) => commit('updateUserRelationship', [relationship]))
    },
    toggleActivationStatus ({ rootState, commit }, { user }) {
      const api = user.deactivated ? rootState.api.backendInteractor.activateUser : rootState.api.backendInteractor.deactivateUser
      api({ user })
        .then((user) => { const deactivated = !user.is_active; commit('updateActivationStatus', { user, deactivated }) })
    },
    registerPushNotifications (store) {
      const token = store.state.currentUser.credentials
      const vapidPublicKey = store.rootState.instance.vapidPublicKey
      const isEnabled = store.rootState.config.webPushNotifications
      const notificationVisibility = store.rootState.config.notificationVisibility

      registerPushNotifications(isEnabled, vapidPublicKey, token, notificationVisibility)
    },
    unregisterPushNotifications (store) {
      const token = store.state.currentUser.credentials

      unregisterPushNotifications(token)
    },
    addNewUsers ({ commit }, users) {
      commit('addNewUsers', users)
    },
    addNewStatuses (store, { statuses }) {
      const users = map(statuses, 'user')
      const retweetedUsers = compact(map(statuses, 'retweeted_status.user'))
      store.commit('addNewUsers', users)
      store.commit('addNewUsers', retweetedUsers)

      each(statuses, (status) => {
        // Reconnect users to statuses
        store.commit('setUserForStatus', status)
        // Set pinned statuses to user
        store.commit('setPinnedToUser', status)
      })
      each(compact(map(statuses, 'retweeted_status')), (status) => {
        // Reconnect users to retweets
        store.commit('setUserForStatus', status)
        // Set pinned retweets to user
        store.commit('setPinnedToUser', status)
      })
    },
    addNewNotifications (store, { notifications }) {
      const users = map(notifications, 'from_profile')
      const targetUsers = map(notifications, 'target').filter(_ => _)
      const notificationIds = notifications.map(_ => _.id)
      store.commit('addNewUsers', users)
      store.commit('addNewUsers', targetUsers)

      const notificationsObject = store.rootState.statuses.notifications.idStore
      const relevantNotifications = Object.entries(notificationsObject)
        .filter(([k, val]) => notificationIds.includes(k))
        .map(([k, val]) => val)

      // Reconnect users to notifications
      each(relevantNotifications, (notification) => {
        store.commit('setUserForNotification', notification)
      })
    },
    searchUsers ({ rootState, commit }, { query }) {
      return rootState.api.backendInteractor.searchUsers({ query })
        .then((users) => {
          commit('addNewUsers', users)
          return users
        })
    },
    async signUp (store, userInfo) {
      store.commit('signUpPending')

      const rootState = store.rootState

      try {
        const data = await rootState.api.backendInteractor.register(
          { params: { ...userInfo } }
        )
        store.commit('signUpSuccess')
        store.commit('setToken', data.access_token)
        store.dispatch('loginUser', data.access_token)
      } catch (e) {
        const errors = e.message
        store.commit('signUpFailure', errors)
        throw e
      }
    },
    async getCaptcha (store) {
      return store.rootState.api.backendInteractor.getCaptcha()
    },

    logout (store) {
      const { oauth, instance } = store.rootState

      const data = {
        ...oauth,
        commit: store.commit,
        instance: instance.server
      }

      return oauthApi.getOrCreateApp(data)
        .then((app) => {
          const params = {
            app,
            instance: data.instance,
            token: oauth.userToken
          }

          return oauthApi.revokeToken(params)
        })
        .then(() => {
          store.commit('clearCurrentUser')
          store.dispatch('disconnectFromSocket')
          store.commit('clearToken')
          store.dispatch('stopFetchingTimeline', 'friends')
          store.commit('setBackendInteractor', backendInteractorService(store.getters.getToken()))
          store.dispatch('stopFetchingNotifications')
          store.dispatch('stopFetchingLists')
          store.dispatch('stopFetchingFollowRequests')
          store.commit('clearNotifications')
          store.commit('resetStatuses')
          store.dispatch('resetChats')
          store.dispatch('setLastTimeline', 'public-timeline')
          store.dispatch('setLayoutWidth', windowWidth())
          store.dispatch('setLayoutHeight', windowHeight())
          store.commit('clearServerSideStorage')
        })
    },
    loginUser (store, accessToken) {
      return new Promise((resolve, reject) => {
        const commit = store.commit
        const dispatch = store.dispatch
        commit('beginLogin')
        store.rootState.api.backendInteractor.verifyCredentials(accessToken)
          .then((data) => {
            if (!data.error) {
              const user = data
              // user.credentials = userCredentials
              user.credentials = accessToken
              user.blockIds = []
              user.muteIds = []
              user.domainMutes = []
              commit('setCurrentUser', user)
              commit('setServerSideStorage', user)
              commit('addNewUsers', [user])

              dispatch('fetchEmoji')

              getNotificationPermission()
                .then(permission => commit('setNotificationPermission', permission))

              // Set our new backend interactor
              commit('setBackendInteractor', backendInteractorService(accessToken))
              dispatch('pushServerSideStorage')

              if (user.token) {
                dispatch('setWsToken', user.token)

                // Initialize the shout socket.
                dispatch('initializeSocket')
              }

              const startPolling = () => {
                // Start getting fresh posts.
                dispatch('startFetchingTimeline', { timeline: 'friends' })

                // Start fetching notifications
                dispatch('startFetchingNotifications')

                // Start fetching chats
                dispatch('startFetchingChats')
              }

              dispatch('startFetchingLists')

              if (user.locked) {
                dispatch('startFetchingFollowRequests')
              }

              if (store.getters.mergedConfig.useStreamingApi) {
                dispatch('fetchTimeline', { timeline: 'friends', since: null })
                dispatch('fetchNotifications', { since: null })
                dispatch('enableMastoSockets', true).catch((error) => {
                  console.error('Failed initializing MastoAPI Streaming socket', error)
                }).then(() => {
                  dispatch('fetchChats', { latest: true })
                  setTimeout(() => dispatch('setNotificationsSilence', false), 10000)
                })
              } else {
                startPolling()
              }

              // Get user mutes
              dispatch('fetchMutes')

              dispatch('setLayoutWidth', windowWidth())
              dispatch('setLayoutHeight', windowHeight())

              // Fetch our friends
              store.rootState.api.backendInteractor.fetchFriends({ id: user.id })
                .then((friends) => commit('addNewUsers', friends))
            } else {
              const response = data.error
              // Authentication failed
              commit('endLogin')

              // remove authentication token on client/authentication errors
              if ([400, 401, 403, 422].includes(response.status)) {
                commit('clearToken')
              }

              if (response.status === 401) {
                reject(new Error('Wrong username or password'))
              } else {
                reject(new Error('An error occurred, please try again'))
              }
            }
            commit('endLogin')
            resolve()
          })
          .catch((error) => {
            console.log(error)
            commit('endLogin')
            reject(new Error('Failed to connect to server, try again'))
          })
      })
    }
  }
}

export default users
