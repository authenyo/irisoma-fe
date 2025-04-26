import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faSearch,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons'
import { debounce } from 'lodash'
import Checkbox from '../checkbox/checkbox.vue'

library.add(
  faSearch,
  faChevronLeft
)

const ListsUserSearch = {
  components: {
    Checkbox
  },
  emits: ['loading', 'loadingDone', 'results'],
  data () {
    return {
      loading: false,
      query: '',
      followingOnly: true
    }
  },
  methods: {
    onInput: debounce(function () {
      this.search(this.query)
    }, 2000),
    search (query) {
      if (!query) {
        this.loading = false
        return
      }

      this.loading = true
      this.$emit('loading')
      this.userIds = []
      this.$store.dispatch('search', { q: query, resolve: true, type: 'accounts', following: this.followingOnly })
        .then(data => {
          this.$emit('results', data.accounts.map(a => a.id))
        })
        .finally(() => {
          this.loading = false
          this.$emit('loadingDone')
        })
    }
  }
}

export default ListsUserSearch
