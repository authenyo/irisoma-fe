const postStatus = {
  state: {
    params: null,
    modalActivated: false
  },
  mutations: {
    openPostStatusModal (state, params) {
      state.params = params
      state.modalActivated = true
    },
    closePostStatusModal (state) {
      state.modalActivated = false
    },
    resetPostStatusModal (state) {
      state.params = null
    }
  },
  actions: {
    openPostStatusModal ({ commit }, params) {
      commit('openPostStatusModal', params)
    },
    closePostStatusModal ({ commit }) {
      commit('closePostStatusModal')
    },
    resetPostStatusModal ({ commit }) {
      commit('resetPostStatusModal')
    }
  }
}

export default postStatus
