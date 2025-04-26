import filter from 'lodash/filter'

const reports = {
  state: {
    reportModal: {
      userId: null,
      statuses: [],
      preTickedIds: [],
      activated: false
    },
    reports: {}
  },
  mutations: {
    openUserReportingModal (state, { userId, statuses, preTickedIds }) {
      state.reportModal.userId = userId
      state.reportModal.statuses = statuses
      state.reportModal.preTickedIds = preTickedIds
      state.reportModal.activated = true
    },
    closeUserReportingModal (state) {
      state.reportModal.activated = false
    },
    setReportState (reportsState, { id, state }) {
      reportsState.reports[id].state = state
    },
    addReport (state, report) {
      state.reports[report.id] = report
    }
  },
  actions: {
    openUserReportingModal ({ rootState, commit }, { userId, statusIds = [] }) {
      const preTickedStatuses = statusIds.map(id => rootState.statuses.allStatusesObject[id])
      const preTickedIds = statusIds
      const statuses = preTickedStatuses.concat(
        filter(rootState.statuses.allStatuses,
          status => status.user.id === userId && !preTickedIds.includes(status.id)
        )
      )
      commit('openUserReportingModal', { userId, statuses, preTickedIds })
    },
    closeUserReportingModal ({ commit }) {
      commit('closeUserReportingModal')
    },
    setReportState ({ commit, dispatch, rootState }, { id, state }) {
      const oldState = rootState.reports.reports[id].state
      commit('setReportState', { id, state })
      rootState.api.backendInteractor.setReportState({ id, state }).catch(e => {
        console.error('Failed to set report state', e)
        dispatch('pushGlobalNotice', {
          level: 'error',
          messageKey: 'general.generic_error_message',
          messageArgs: [e.message],
          timeout: 5000
        })
        commit('setReportState', { id, state: oldState })
      })
    },
    addReport ({ commit }, report) {
      commit('addReport', report)
    }
  }
}

export default reports
