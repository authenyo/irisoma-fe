import { remove, find } from 'lodash'

export const defaultState = {
  allLists: [],
  allListsObject: {}
}

export const mutations = {
  setLists (state, value) {
    state.allLists = value
  },
  setList (state, { listId, title }) {
    if (!state.allListsObject[listId]) {
      state.allListsObject[listId] = { accountIds: [] }
    }
    state.allListsObject[listId].title = title

    const entry = find(state.allLists, { id: listId })
    if (!entry) {
      state.allLists.push({ id: listId, title })
    } else {
      entry.title = title
    }
  },
  setListAccounts (state, { listId, accountIds }) {
    if (!state.allListsObject[listId]) {
      state.allListsObject[listId] = { accountIds: [] }
    }
    state.allListsObject[listId].accountIds = accountIds
  },
  addListAccount (state, { listId, accountId }) {
    if (!state.allListsObject[listId]) {
      state.allListsObject[listId] = { accountIds: [] }
    }
    state.allListsObject[listId].accountIds.push(accountId)
  },
  removeListAccount (state, { listId, accountId }) {
    if (!state.allListsObject[listId]) {
      state.allListsObject[listId] = { accountIds: [] }
    }
    const { accountIds } = state.allListsObject[listId]
    const set = new Set(accountIds)
    set.delete(accountId)
    state.allListsObject[listId].accountIds = [...set]
  },
  deleteList (state, { listId }) {
    delete state.allListsObject[listId]
    remove(state.allLists, list => list.id === listId)
  }
}

const actions = {
  setLists ({ commit }, value) {
    commit('setLists', value)
  },
  createList ({ rootState, commit }, { title }) {
    return rootState.api.backendInteractor.createList({ title })
      .then((list) => {
        commit('setList', { listId: list.id, title })
        return list
      })
  },
  fetchList ({ rootState, commit }, { listId }) {
    return rootState.api.backendInteractor.getList({ listId })
      .then((list) => commit('setList', { listId: list.id, title: list.title }))
  },
  fetchListAccounts ({ rootState, commit }, { listId }) {
    return rootState.api.backendInteractor.getListAccounts({ listId })
      .then((accountIds) => commit('setListAccounts', { listId, accountIds }))
  },
  setList ({ rootState, commit }, { listId, title }) {
    rootState.api.backendInteractor.updateList({ listId, title })
    commit('setList', { listId, title })
  },
  setListAccounts ({ rootState, commit }, { listId, accountIds }) {
    const saved = rootState.lists.allListsObject[listId].accountIds || []
    const added = accountIds.filter(id => !saved.includes(id))
    const removed = saved.filter(id => !accountIds.includes(id))
    commit('setListAccounts', { listId, accountIds })
    if (added.length > 0) {
      rootState.api.backendInteractor.addAccountsToList({ listId, accountIds: added })
    }
    if (removed.length > 0) {
      rootState.api.backendInteractor.removeAccountsFromList({ listId, accountIds: removed })
    }
  },
  addListAccount ({ rootState, commit }, { listId, accountId }) {
    return rootState
      .api
      .backendInteractor
      .addAccountsToList({ listId, accountIds: [accountId] })
      .then((result) => {
        commit('addListAccount', { listId, accountId })
        return result
      })
  },
  removeListAccount ({ rootState, commit }, { listId, accountId }) {
    return rootState
      .api
      .backendInteractor
      .removeAccountsFromList({ listId, accountIds: [accountId] })
      .then((result) => {
        commit('removeListAccount', { listId, accountId })
        return result
      })
  },
  deleteList ({ rootState, commit }, { listId }) {
    rootState.api.backendInteractor.deleteList({ listId })
    commit('deleteList', { listId })
  }
}

export const getters = {
  findListTitle: state => id => {
    if (!state.allListsObject[id]) return
    return state.allListsObject[id].title
  },
  findListAccounts: state => id => {
    return [...state.allListsObject[id].accountIds]
  }
}

const lists = {
  state: defaultState,
  mutations,
  actions,
  getters
}

export default lists
