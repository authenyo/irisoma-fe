import { library } from '@fortawesome/fontawesome-svg-core'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { mapState } from 'vuex'

import DialogModal from '../dialog_modal/dialog_modal.vue'
import Popover from '../popover/popover.vue'

library.add(faChevronRight)

const UserListMenu = {
  props: [
    'user'
  ],
  data () {
    return {}
  },
  components: {
    DialogModal,
    Popover
  },
  created () {
    this.$store.dispatch('fetchUserInLists', this.user.id)
  },
  computed: {
    ...mapState({
      allLists: state => state.lists.allLists
    }),
    inListsSet () {
      return new Set(this.user.inLists.map(x => x.id))
    },
    lists () {
      if (!this.user.inLists) return []
      return this.allLists.map(list => ({
        ...list,
        inList: this.inListsSet.has(list.id)
      }))
    }
  },
  methods: {
    toggleList (listId) {
      if (this.inListsSet.has(listId)) {
        this.$store.dispatch('removeListAccount', { accountId: this.user.id, listId }).then((response) => {
          if (!response.ok) { return }
          this.$store.dispatch('fetchUserInLists', this.user.id)
        })
      } else {
        this.$store.dispatch('addListAccount', { accountId: this.user.id, listId }).then((response) => {
          if (!response.ok) { return }
          this.$store.dispatch('fetchUserInLists', this.user.id)
        })
      }
    },
    toggleRight (right) {
      const store = this.$store
      if (this.user.rights[right]) {
        store.state.api.backendInteractor.deleteRight({ user: this.user, right }).then(response => {
          if (!response.ok) { return }
          store.commit('updateRight', { user: this.user, right, value: false })
        })
      } else {
        store.state.api.backendInteractor.addRight({ user: this.user, right }).then(response => {
          if (!response.ok) { return }
          store.commit('updateRight', { user: this.user, right, value: true })
        })
      }
    },
    toggleActivationStatus () {
      this.$store.dispatch('toggleActivationStatus', { user: this.user })
    },
    deleteUserDialog (show) {
      this.showDeleteUserDialog = show
    },
    deleteUser () {
      const store = this.$store
      const user = this.user
      const { id, name } = user
      store.state.api.backendInteractor.deleteUser({ user })
        .then(e => {
          this.$store.dispatch('markStatusesAsDeleted', status => user.id === status.user.id)
          const isProfile = this.$route.name === 'external-user-profile' || this.$route.name === 'user-profile'
          const isTargetUser = this.$route.params.name === name || this.$route.params.id === id
          if (isProfile && isTargetUser) {
            window.history.back()
          }
        })
    },
    setToggled (value) {
      this.toggled = value
    }
  }
}

export default UserListMenu
