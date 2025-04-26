<template>
  <router-link
    :title="user.screen_name_ui"
    :to="userProfileLink(user)"
  >
    {{ at ? '@' : '' }}{{ user.screen_name_ui }}<UnicodeDomainIndicator
      :user="user"
    />
  </router-link>
</template>

<script>
import UnicodeDomainIndicator from '../unicode_domain_indicator/unicode_domain_indicator.vue'
import generateProfileLink from 'src/services/user_profile_link_generator/user_profile_link_generator'

const UserLink = {
  props: {
    user: Object,
    at: {
      type: Boolean,
      default: true
    }
  },
  components: {
    UnicodeDomainIndicator
  },
  methods: {
    userProfileLink (user) {
      return generateProfileLink(
        user.id, user.screen_name,
        this.$store.state.instance.restrictedNicknames
      )
    }
  }
}

export default UserLink
</script>
