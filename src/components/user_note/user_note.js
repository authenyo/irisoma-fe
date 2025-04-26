const UserNote = {
  props: {
    user: Object,
    relationship: Object,
    editable: Boolean
  },
  data () {
    return {
      localNote: '',
      editing: false,
      frozen: false
    }
  },
  computed: {
    shouldShow () {
      return this.relationship.note || this.editing
    }
  },
  methods: {
    startEditing () {
      this.localNote = this.relationship.note
      this.editing = true
    },
    cancelEditing () {
      this.editing = false
    },
    finalizeEditing () {
      this.frozen = true

      this.$store.dispatch('editUserNote', {
        id: this.user.id,
        comment: this.localNote
      })
        .then(() => {
          this.frozen = false
          this.editing = false
        })
        .catch(() => {
          this.frozen = false
        })
    }
  }
}

export default UserNote
