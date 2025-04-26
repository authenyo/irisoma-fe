const FETCH_ANNOUNCEMENT_INTERVAL_MS = 1000 * 60 * 5

export const defaultState = {
  announcements: [],
  supportsAnnouncements: true,
  fetchAnnouncementsTimer: undefined
}

export const mutations = {
  setAnnouncements (state, announcements) {
    state.announcements = announcements
  },
  setAnnouncementRead (state, { id, read }) {
    const index = state.announcements.findIndex(a => a.id === id)

    if (index < 0) {
      return
    }

    state.announcements[index].read = read
  },
  setFetchAnnouncementsTimer (state, timer) {
    state.fetchAnnouncementsTimer = timer
  },
  setSupportsAnnouncements (state, supportsAnnouncements) {
    state.supportsAnnouncements = supportsAnnouncements
  }
}

export const getters = {
  unreadAnnouncementCount (state, _getters, rootState) {
    if (!rootState.users.currentUser) {
      return 0
    }

    const unread = state.announcements.filter(announcement => !(announcement.inactive || announcement.read))
    return unread.length
  }
}

const announcements = {
  state: defaultState,
  mutations,
  getters,
  actions: {
    fetchAnnouncements (store) {
      if (!store.state.supportsAnnouncements) {
        return Promise.resolve()
      }

      const currentUser = store.rootState.users.currentUser
      const isAdmin = currentUser && currentUser.privileges.includes('announcements_manage_announcements')

      const getAnnouncements = async () => {
        if (!isAdmin) {
          return store.rootState.api.backendInteractor.fetchAnnouncements()
        }

        const all = await store.rootState.api.backendInteractor.adminFetchAnnouncements()
        const visible = await store.rootState.api.backendInteractor.fetchAnnouncements()
        const visibleObject = visible.reduce((a, c) => {
          a[c.id] = c
          return a
        }, {})
        const getWithinVisible = announcement => visibleObject[announcement.id]

        all.forEach(announcement => {
          const visibleAnnouncement = getWithinVisible(announcement)
          if (!visibleAnnouncement) {
            announcement.inactive = true
          } else {
            announcement.read = visibleAnnouncement.read
          }
        })

        return all
      }

      return getAnnouncements()
        .then(announcements => {
          store.commit('setAnnouncements', announcements)
        })
        .catch(error => {
          // If and only if backend does not support announcements, it would return 404.
          // In this case, silently ignores it.
          if (error && error.statusCode === 404) {
            store.commit('setSupportsAnnouncements', false)
          } else {
            throw error
          }
        })
    },
    markAnnouncementAsRead (store, id) {
      return store.rootState.api.backendInteractor.dismissAnnouncement({ id })
        .then(() => {
          store.commit('setAnnouncementRead', { id, read: true })
        })
    },
    startFetchingAnnouncements (store) {
      if (store.state.fetchAnnouncementsTimer) {
        return
      }

      const interval = setInterval(() => store.dispatch('fetchAnnouncements'), FETCH_ANNOUNCEMENT_INTERVAL_MS)
      store.commit('setFetchAnnouncementsTimer', interval)

      return store.dispatch('fetchAnnouncements')
    },
    stopFetchingAnnouncements (store) {
      const interval = store.state.fetchAnnouncementsTimer
      store.commit('setFetchAnnouncementsTimer', undefined)
      clearInterval(interval)
    },
    postAnnouncement (store, { content, startsAt, endsAt, allDay }) {
      return store.rootState.api.backendInteractor.postAnnouncement({ content, startsAt, endsAt, allDay })
        .then(() => {
          return store.dispatch('fetchAnnouncements')
        })
    },
    editAnnouncement (store, { id, content, startsAt, endsAt, allDay }) {
      return store.rootState.api.backendInteractor.editAnnouncement({ id, content, startsAt, endsAt, allDay })
        .then(() => {
          return store.dispatch('fetchAnnouncements')
        })
    },
    deleteAnnouncement (store, id) {
      return store.rootState.api.backendInteractor.deleteAnnouncement({ id })
        .then(() => {
          return store.dispatch('fetchAnnouncements')
        })
    }
  }
}

export default announcements
