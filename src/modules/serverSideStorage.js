import { toRaw } from 'vue'
import { isEqual, cloneDeep, set, get, clamp, flatten, groupBy, findLastIndex, takeRight, uniqWith } from 'lodash'
import { CURRENT_UPDATE_COUNTER } from 'src/components/update_notification/update_notification.js'

export const VERSION = 1
export const NEW_USER_DATE = new Date('2022-08-04') // date of writing this, basically

export const COMMAND_TRIM_FLAGS = 1000
export const COMMAND_TRIM_FLAGS_AND_RESET = 1001

export const defaultState = {
  // do we need to update data on server?
  dirty: false,
  // storage of flags - stuff that can only be set and incremented
  flagStorage: {
    updateCounter: 0, // Counter for most recent update notification seen
    reset: 0 // special flag that can be used to force-reset all flags, debug purposes only
    // special reset codes:
    // 1000: trim keys to those known by currently running FE
    // 1001: same as above + reset everything to 0
  },
  prefsStorage: {
    _journal: [],
    simple: {
      dontShowUpdateNotifs: false,
      collapseNav: false
    },
    collections: {
      pinnedNavItems: ['home', 'dms', 'chats']
    }
  },
  // raw data
  raw: null,
  // local cache
  cache: null
}

export const newUserFlags = {
  ...defaultState.flagStorage,
  updateCounter: CURRENT_UPDATE_COUNTER // new users don't need to see update notification
}

export const _moveItemInArray = (array, value, movement) => {
  const oldIndex = array.indexOf(value)
  const newIndex = oldIndex + movement
  const newArray = [...array]
  // remove old
  newArray.splice(oldIndex, 1)
  // add new
  newArray.splice(clamp(newIndex, 0, newArray.length + 1), 0, value)
  return newArray
}

const _wrapData = (data, userName) => ({
  ...data,
  _user: userName,
  _timestamp: Date.now(),
  _version: VERSION
})

const _checkValidity = (data) => data._timestamp > 0 && data._version > 0

const _verifyPrefs = (state) => {
  state.prefsStorage = state.prefsStorage || {
    simple: {},
    collections: {}
  }
  Object.entries(defaultState.prefsStorage.simple).forEach(([k, v]) => {
    if (typeof v === 'number' || typeof v === 'boolean') return
    console.warn(`Preference simple.${k} as invalid type, reinitializing`)
    set(state.prefsStorage.simple, k, defaultState.prefsStorage.simple[k])
  })
  Object.entries(defaultState.prefsStorage.collections).forEach(([k, v]) => {
    if (Array.isArray(v)) return
    console.warn(`Preference collections.${k} as invalid type, reinitializing`)
    set(state.prefsStorage.collections, k, defaultState.prefsStorage.collections[k])
  })
}

export const _getRecentData = (cache, live) => {
  const result = { recent: null, stale: null, needUpload: false }
  const cacheValid = _checkValidity(cache || {})
  const liveValid = _checkValidity(live || {})
  if (!liveValid && cacheValid) {
    result.needUpload = true
    console.debug('Nothing valid stored on server, assuming cache to be source of truth')
    result.recent = cache
    result.stale = live
  } else if (!cacheValid && liveValid) {
    console.debug('Valid storage on server found, no local cache found, using live as source of truth')
    result.recent = live
    result.stale = cache
  } else if (cacheValid && liveValid) {
    console.debug('Both sources have valid data, figuring things out...')
    if (live._timestamp === cache._timestamp && live._version === cache._version) {
      console.debug('Same version/timestamp on both source, source of truth irrelevant')
      result.recent = cache
      result.stale = live
    } else {
      console.debug('Different timestamp, figuring out which one is more recent')
      if (live._timestamp < cache._timestamp) {
        result.recent = cache
        result.stale = live
      } else {
        result.recent = live
        result.stale = cache
      }
    }
  } else {
    console.debug('Both sources are invalid, start from scratch')
    result.needUpload = true
  }
  return result
}

export const _getAllFlags = (recent, stale) => {
  return Array.from(new Set([
    ...Object.keys(toRaw((recent || {}).flagStorage || {})),
    ...Object.keys(toRaw((stale || {}).flagStorage || {}))
  ]))
}

export const _mergeFlags = (recent, stale, allFlagKeys) => {
  if (!stale.flagStorage) return recent.flagStorage
  if (!recent.flagStorage) return stale.flagStorage
  return Object.fromEntries(allFlagKeys.map(flag => {
    const recentFlag = recent.flagStorage[flag]
    const staleFlag = stale.flagStorage[flag]
    // use flag that is of higher value
    return [flag, Number((recentFlag > staleFlag ? recentFlag : staleFlag) || 0)]
  }))
}

const _mergeJournal = (...journals) => {
  // Ignore invalid journal entries
  const allJournals = flatten(
    journals.map(j => Array.isArray(j) ? j : [])
  ).filter(entry =>
    Object.prototype.hasOwnProperty.call(entry, 'path') &&
    Object.prototype.hasOwnProperty.call(entry, 'operation') &&
    Object.prototype.hasOwnProperty.call(entry, 'args') &&
    Object.prototype.hasOwnProperty.call(entry, 'timestamp')
  )
  const grouped = groupBy(allJournals, 'path')
  const trimmedGrouped = Object.entries(grouped).map(([path, journal]) => {
    // side effect
    journal.sort((a, b) => a.timestamp > b.timestamp ? 1 : -1)

    if (path.startsWith('collections')) {
      const lastRemoveIndex = findLastIndex(journal, ({ operation }) => operation === 'removeFromCollection')
      // everything before last remove is unimportant
      let remainder
      if (lastRemoveIndex > 0) {
        remainder = journal.slice(lastRemoveIndex)
      } else {
        // everything else doesn't need trimming
        remainder = journal
      }
      return uniqWith(remainder, (a, b) => {
        if (a.path !== b.path) { return false }
        if (a.operation !== b.operation) { return false }
        if (a.operation === 'addToCollection') {
          return a.args[0] === b.args[0]
        }
        return false
      })
    } else if (path.startsWith('simple')) {
      // Only the last record is important
      return takeRight(journal)
    } else {
      return journal
    }
  })
  return flatten(trimmedGrouped)
    .sort((a, b) => a.timestamp > b.timestamp ? 1 : -1)
}

export const _mergePrefs = (recent, stale, allFlagKeys) => {
  if (!stale) return recent
  if (!recent) return stale
  const { _journal: recentJournal, ...recentData } = recent
  const { _journal: staleJournal } = stale
  /** Journal entry format:
   * path: path to entry in prefsStorage
   * timestamp: timestamp of the change
   * operation: operation type
   * arguments: array of arguments, depends on operation type
   *
   * currently only supported operation type is "set" which just sets the value
   * to requested one. Intended only to be used with simple preferences (boolean, number)
   * shouldn't be used with collections!
   */
  const resultOutput = { ...recentData }
  const totalJournal = _mergeJournal(staleJournal, recentJournal)
  totalJournal.forEach(({ path, timestamp, operation, command, args }) => {
    if (path.startsWith('_')) {
      console.error(`journal contains entry to edit internal (starts with _) field '${path}', something is incorrect here, ignoring.`)
      return
    }
    switch (operation) {
      case 'set':
        set(resultOutput, path, args[0])
        break
      case 'addToCollection':
        set(resultOutput, path, Array.from(new Set(get(resultOutput, path)).add(args[0])))
        break
      case 'removeFromCollection': {
        const newSet = new Set(get(resultOutput, path))
        newSet.delete(args[0])
        set(resultOutput, path, Array.from(newSet))
        break
      }
      case 'reorderCollection': {
        const [value, movement] = args
        set(resultOutput, path, _moveItemInArray(get(resultOutput, path), value, movement))
        break
      }
      default:
        console.error(`Unknown journal operation: '${operation}', did we forget to run reverse migrations beforehand?`)
    }
  })
  return { ...resultOutput, _journal: totalJournal }
}

export const _resetFlags = (totalFlags, knownKeys = defaultState.flagStorage) => {
  let result = { ...totalFlags }
  const allFlagKeys = Object.keys(totalFlags)
  // flag reset functionality
  if (totalFlags.reset >= COMMAND_TRIM_FLAGS && totalFlags.reset <= COMMAND_TRIM_FLAGS_AND_RESET) {
    console.debug('Received command to trim the flags')
    const knownKeysSet = new Set(Object.keys(knownKeys))

    // Trim
    result = {}
    allFlagKeys.forEach(flag => {
      if (knownKeysSet.has(flag)) {
        result[flag] = totalFlags[flag]
      }
    })

    // Reset
    if (totalFlags.reset === COMMAND_TRIM_FLAGS_AND_RESET) {
      // 1001 - and reset everything to 0
      console.debug('Received command to reset the flags')
      Object.keys(knownKeys).forEach(flag => { result[flag] = 0 })
    }
  } else if (totalFlags.reset > 0 && totalFlags.reset < 9000) {
    console.debug('Received command to reset the flags')
    allFlagKeys.forEach(flag => { result[flag] = 0 })
  }
  result.reset = 0
  return result
}

export const _doMigrations = (cache) => {
  if (!cache) return cache

  if (cache._version < VERSION) {
    console.debug('Local cached data has older version, seeing if there any migrations that can be applied')

    // no migrations right now since we only have one version
    console.debug('No migrations found')
  }

  if (cache._version > VERSION) {
    console.debug('Local cached data has newer version, seeing if there any reverse migrations that can be applied')

    // no reverse migrations right now but we leave a possibility of loading a hotpatch if need be
    if (window._PLEROMA_HOTPATCH) {
      if (window._PLEROMA_HOTPATCH.reverseMigrations) {
        console.debug('Found hotpatch migration, applying')
        return window._PLEROMA_HOTPATCH.reverseMigrations.call({}, 'serverSideStorage', { from: cache._version, to: VERSION }, cache)
      }
    }
  }

  return cache
}

export const mutations = {
  clearServerSideStorage (state, userData) {
    state = { ...cloneDeep(defaultState) }
  },
  setServerSideStorage (state, userData) {
    const live = userData.storage
    state.raw = live
    let cache = state.cache
    if (cache && cache._user !== userData.fqn) {
      console.warn('cache belongs to another user! reinitializing local cache!')
      cache = null
    }

    cache = _doMigrations(cache)

    let { recent, stale, needsUpload } = _getRecentData(cache, live)

    const userNew = userData.created_at > NEW_USER_DATE
    const flagsTemplate = userNew ? newUserFlags : defaultState.flagStorage
    let dirty = false

    if (recent === null) {
      console.debug(`Data is empty, initializing for ${userNew ? 'new' : 'existing'} user`)
      recent = _wrapData({
        flagStorage: { ...flagsTemplate },
        prefsStorage: { ...defaultState.prefsStorage }
      })
    }

    if (!needsUpload && recent && stale) {
      console.debug('Checking if data needs merging...')
      // discarding timestamps and versions
      const { _timestamp: _0, _version: _1, ...recentData } = recent
      const { _timestamp: _2, _version: _3, ...staleData } = stale
      dirty = !isEqual(recentData, staleData)
      console.debug(`Data ${dirty ? 'needs' : 'doesn\'t need'} merging`)
    }

    const allFlagKeys = _getAllFlags(recent, stale)
    let totalFlags
    let totalPrefs
    if (dirty) {
      // Merge the flags
      console.debug('Merging the data...')
      totalFlags = _mergeFlags(recent, stale, allFlagKeys)
      _verifyPrefs(recent)
      _verifyPrefs(stale)
      totalPrefs = _mergePrefs(recent.prefsStorage, stale.prefsStorage)
    } else {
      totalFlags = recent.flagStorage
      totalPrefs = recent.prefsStorage
    }

    totalFlags = _resetFlags(totalFlags)

    recent.flagStorage = { ...flagsTemplate, ...totalFlags }
    recent.prefsStorage = { ...defaultState.prefsStorage, ...totalPrefs }

    state.dirty = dirty || needsUpload
    state.cache = recent
    // set local timestamp to smaller one if we don't have any changes
    if (stale && recent && !state.dirty) {
      state.cache._timestamp = Math.min(stale._timestamp, recent._timestamp)
    }
    state.flagStorage = state.cache.flagStorage
    state.prefsStorage = state.cache.prefsStorage
  },
  setFlag (state, { flag, value }) {
    state.flagStorage[flag] = value
    state.dirty = true
  },
  setPreference (state, { path, value }) {
    if (path.startsWith('_')) {
      console.error(`tried to edit internal (starts with _) field '${path}', ignoring.`)
      return
    }
    set(state.prefsStorage, path, value)
    state.prefsStorage._journal = [
      ...state.prefsStorage._journal,
      { operation: 'set', path, args: [value], timestamp: Date.now() }
    ]
    state.dirty = true
  },
  addCollectionPreference (state, { path, value }) {
    if (path.startsWith('_')) {
      console.error(`tried to edit internal (starts with _) field '${path}', ignoring.`)
      return
    }
    const collection = new Set(get(state.prefsStorage, path))
    collection.add(value)
    set(state.prefsStorage, path, [...collection])
    state.prefsStorage._journal = [
      ...state.prefsStorage._journal,
      { operation: 'addToCollection', path, args: [value], timestamp: Date.now() }
    ]
    state.dirty = true
  },
  removeCollectionPreference (state, { path, value }) {
    if (path.startsWith('_')) {
      console.error(`tried to edit internal (starts with _) field '${path}', ignoring.`)
      return
    }
    const collection = new Set(get(state.prefsStorage, path))
    collection.delete(value)
    set(state.prefsStorage, path, [...collection])
    state.prefsStorage._journal = [
      ...state.prefsStorage._journal,
      { operation: 'removeFromCollection', path, args: [value], timestamp: Date.now() }
    ]
    state.dirty = true
  },
  reorderCollectionPreference (state, { path, value, movement }) {
    if (path.startsWith('_')) {
      console.error(`tried to edit internal (starts with _) field '${path}', ignoring.`)
      return
    }
    const collection = get(state.prefsStorage, path)
    const newCollection = _moveItemInArray(collection, value, movement)
    set(state.prefsStorage, path, newCollection)
    state.prefsStorage._journal = [
      ...state.prefsStorage._journal,
      { operation: 'arrangeCollection', path, args: [value], timestamp: Date.now() }
    ]
    state.dirty = true
  },
  updateCache (state, { username }) {
    state.prefsStorage._journal = _mergeJournal(state.prefsStorage._journal)
    state.cache = _wrapData({
      flagStorage: toRaw(state.flagStorage),
      prefsStorage: toRaw(state.prefsStorage)
    }, username)
  }
}

const serverSideStorage = {
  state: {
    ...cloneDeep(defaultState)
  },
  mutations,
  actions: {
    pushServerSideStorage ({ state, rootState, commit }, { force = false } = {}) {
      const needPush = state.dirty || force
      console.log(needPush)
      if (!needPush) return
      commit('updateCache', { username: rootState.users.currentUser.fqn })
      const params = { pleroma_settings_store: { 'pleroma-fe': state.cache } }
      rootState.api.backendInteractor
        .updateProfile({ params })
        .then((user) => {
          commit('setServerSideStorage', user)
          state.dirty = false
        })
    }
  }
}

export default serverSideStorage
