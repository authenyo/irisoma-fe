export const filterNavigation = (list = [], { hasChats, hasAnnouncements, isFederating, isPrivate, currentUser }) => {
  return list.filter(({ criteria, anon, anonRoute }) => {
    const set = new Set(criteria || [])
    if (!isFederating && set.has('federating')) return false
    if (!currentUser && isPrivate && set.has('!private')) return false
    if (!currentUser && !(anon || anonRoute)) return false
    if ((!currentUser || !currentUser.locked) && set.has('lockedUser')) return false
    if (!hasChats && set.has('chats')) return false
    if (!hasAnnouncements && set.has('announcements')) return false
    return true
  })
}

export const getListEntries = state => state.lists.allLists.map(list => ({
  name: 'list-' + list.id,
  routeObject: { name: 'lists-timeline', params: { id: list.id } },
  labelRaw: list.title,
  iconLetter: list.title[0]
}))
