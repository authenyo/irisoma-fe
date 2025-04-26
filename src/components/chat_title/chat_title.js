import UserAvatar from '../user_avatar/user_avatar.vue'
import RichContent from 'src/components/rich_content/rich_content.jsx'
import { defineAsyncComponent } from 'vue'

export default {
  name: 'ChatTitle',
  components: {
    UserAvatar,
    RichContent,
    UserPopover: defineAsyncComponent(() => import('../user_popover/user_popover.vue'))
  },
  props: [
    'user', 'withAvatar'
  ],
  computed: {
    title () {
      return this.user ? this.user.screen_name_ui : ''
    },
    htmlTitle () {
      return this.user ? this.user.name_html : ''
    }
  }
}
