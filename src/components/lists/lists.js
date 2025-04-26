import ListsCard from '../lists_card/lists_card.vue'

const Lists = {
  data () {
    return {
      isNew: false
    }
  },
  components: {
    ListsCard
  },
  computed: {
    lists () {
      return this.$store.state.lists.allLists
    }
  },
  methods: {
    cancelNewList () {
      this.isNew = false
    },
    newList () {
      this.isNew = true
    }
  }
}

export default Lists
