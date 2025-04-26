import ConfirmModal from '../confirm_modal/confirm_modal.vue'

export default {
  props: ['user', 'relationship'],
  data () {
    return {
      inProgress: false,
      showingConfirmRemoveFollower: false
    }
  },
  components: {
    ConfirmModal
  },
  computed: {
    label () {
      if (this.inProgress) {
        return this.$t('user_card.follow_progress')
      } else {
        return this.$t('user_card.remove_follower')
      }
    },
    shouldConfirmRemoveUserFromFollowers () {
      return this.$store.getters.mergedConfig.modalOnRemoveUserFromFollowers
    }
  },
  methods: {
    showConfirmRemoveUserFromFollowers () {
      this.showingConfirmRemoveFollower = true
    },
    hideConfirmRemoveUserFromFollowers () {
      this.showingConfirmRemoveFollower = false
    },
    onClick () {
      if (!this.shouldConfirmRemoveUserFromFollowers) {
        this.doRemoveUserFromFollowers()
      } else {
        this.showConfirmRemoveUserFromFollowers()
      }
    },
    doRemoveUserFromFollowers () {
      this.inProgress = true
      this.$store.dispatch('removeUserFromFollowers', this.relationship.id).then(() => {
        this.inProgress = false
      })
      this.hideConfirmRemoveUserFromFollowers()
    }
  }
}
