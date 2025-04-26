import { mapState } from 'vuex'
import NavigationEntry from 'src/components/navigation/navigation_entry.vue'
import { getListEntries } from 'src/components/navigation/filter.js'

export const ListsMenuContent = {
  props: [
    'showPin'
  ],
  components: {
    NavigationEntry
  },
  computed: {
    ...mapState({
      lists: getListEntries,
      currentUser: state => state.users.currentUser,
      privateMode: state => state.instance.private,
      federating: state => state.instance.federating
    })
  }
}

export default ListsMenuContent
