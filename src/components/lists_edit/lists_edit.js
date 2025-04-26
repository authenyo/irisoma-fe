import { mapState, mapGetters } from 'vuex'
import BasicUserCard from '../basic_user_card/basic_user_card.vue'
import ListsUserSearch from '../lists_user_search/lists_user_search.vue'
import PanelLoading from 'src/components/panel_loading/panel_loading.vue'
import UserAvatar from '../user_avatar/user_avatar.vue'
import TabSwitcher from 'src/components/tab_switcher/tab_switcher.jsx'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faSearch,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faSearch,
  faChevronLeft
)

const ListsNew = {
  components: {
    BasicUserCard,
    UserAvatar,
    ListsUserSearch,
    TabSwitcher,
    PanelLoading
  },
  data () {
    return {
      title: '',
      titleDraft: '',
      membersUserIds: [],
      removedUserIds: new Set([]), // users we added for members, to undo
      searchUserIds: [],
      addedUserIds: new Set([]), // users we added from search, to undo
      searchLoading: false,
      reallyDelete: false
    }
  },
  created () {
    if (!this.id) return
    this.$store.dispatch('fetchList', { listId: this.id })
      .then(() => {
        this.title = this.findListTitle(this.id)
        this.titleDraft = this.title
      })
    this.$store.dispatch('fetchListAccounts', { listId: this.id })
      .then(() => {
        this.membersUserIds = this.findListAccounts(this.id)
        this.membersUserIds.forEach(userId => {
          this.$store.dispatch('fetchUserIfMissing', userId)
        })
      })
  },
  computed: {
    id () {
      return this.$route.params.id
    },
    membersUsers () {
      return [...this.membersUserIds, ...this.addedUserIds]
        .map(userId => this.findUser(userId)).filter(user => user)
    },
    searchUsers () {
      return this.searchUserIds.map(userId => this.findUser(userId)).filter(user => user)
    },
    ...mapState({
      currentUser: state => state.users.currentUser
    }),
    ...mapGetters(['findUser', 'findListTitle', 'findListAccounts'])
  },
  methods: {
    onInput () {
      this.search(this.query)
    },
    toggleRemoveMember (user) {
      if (this.removedUserIds.has(user.id)) {
        this.id && this.addUser(user)
        this.removedUserIds.delete(user.id)
      } else {
        this.id && this.removeUser(user.id)
        this.removedUserIds.add(user.id)
      }
    },
    toggleAddFromSearch (user) {
      if (this.addedUserIds.has(user.id)) {
        this.id && this.removeUser(user.id)
        this.addedUserIds.delete(user.id)
      } else {
        this.id && this.addUser(user)
        this.addedUserIds.add(user.id)
      }
    },
    isRemoved (user) {
      return this.removedUserIds.has(user.id)
    },
    isAdded (user) {
      return this.addedUserIds.has(user.id)
    },
    addUser (user) {
      this.$store.dispatch('addListAccount', { accountId: user.id, listId: this.id })
    },
    removeUser (userId) {
      this.$store.dispatch('removeListAccount', { accountId: userId, listId: this.id })
    },
    onSearchLoading (results) {
      this.searchLoading = true
    },
    onSearchLoadingDone (results) {
      this.searchLoading = false
    },
    onSearchResults (results) {
      this.searchLoading = false
      this.searchUserIds = results
    },
    updateListTitle () {
      this.$store.dispatch('setList', { listId: this.id, title: this.titleDraft })
        .then(() => {
          this.title = this.findListTitle(this.id)
        })
    },
    createList () {
      this.$store.dispatch('createList', { title: this.titleDraft })
        .then((list) => {
          return this
            .$store
            .dispatch('setListAccounts', { listId: list.id, accountIds: [...this.addedUserIds] })
            .then(() => list.id)
        })
        .then((listId) => {
          this.$router.push({ name: 'lists-timeline', params: { id: listId } })
        })
        .catch((e) => {
          this.$store.dispatch('pushGlobalNotice', {
            messageKey: 'lists.error',
            messageArgs: [e.message],
            level: 'error'
          })
        })
    },
    deleteList () {
      this.$store.dispatch('deleteList', { listId: this.id })
      this.$router.push({ name: 'lists' })
    }
  }
}

export default ListsNew
