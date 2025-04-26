import UserAvatar from '../user_avatar/user_avatar.vue'
import UserListPopover from '../user_list_popover/user_list_popover.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faPlus,
  faMinus,
  faCheck
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faPlus,
  faMinus,
  faCheck
)

const EMOJI_REACTION_COUNT_CUTOFF = 12

const EmojiReactions = {
  name: 'EmojiReactions',
  components: {
    UserAvatar,
    UserListPopover
  },
  props: ['status'],
  data: () => ({
    showAll: false
  }),
  computed: {
    tooManyReactions () {
      return this.status.emoji_reactions.length > EMOJI_REACTION_COUNT_CUTOFF
    },
    emojiReactions () {
      return this.showAll
        ? this.status.emoji_reactions
        : this.status.emoji_reactions.slice(0, EMOJI_REACTION_COUNT_CUTOFF)
    },
    showMoreString () {
      return `+${this.status.emoji_reactions.length - EMOJI_REACTION_COUNT_CUTOFF}`
    },
    accountsForEmoji () {
      return this.status.emoji_reactions.reduce((acc, reaction) => {
        acc[reaction.name] = reaction.accounts || []
        return acc
      }, {})
    },
    loggedIn () {
      return !!this.$store.state.users.currentUser
    },
    remoteInteractionLink () {
      return this.$store.getters.remoteInteractionLink({ statusId: this.status.id })
    }
  },
  methods: {
    toggleShowAll () {
      this.showAll = !this.showAll
    },
    reactedWith (emoji) {
      return this.status.emoji_reactions.find(r => r.name === emoji).me
    },
    async fetchEmojiReactionsByIfMissing () {
      const hasNoAccounts = this.status.emoji_reactions.find(r => !r.accounts)
      if (hasNoAccounts) {
        return await this.$store.dispatch('fetchEmojiReactionsBy', this.status.id)
      }
    },
    reactWith (emoji) {
      this.$store.dispatch('reactWithEmoji', { id: this.status.id, emoji })
    },
    unreact (emoji) {
      this.$store.dispatch('unreactWithEmoji', { id: this.status.id, emoji })
    },
    async emojiOnClick (emoji, event) {
      if (!this.loggedIn) return

      await this.fetchEmojiReactionsByIfMissing()
      if (this.reactedWith(emoji)) {
        this.unreact(emoji)
      } else {
        this.reactWith(emoji)
      }
    },
    counterTriggerAttrs (reaction) {
      return {
        class: [
          'btn',
          'button-default',
          'emoji-reaction-count-button',
          { '-picked-reaction': this.reactedWith(reaction.name) }
        ],
        'aria-label': this.$tc('status.reaction_count_label', reaction.count, { num: reaction.count })
      }
    }
  }
}

export default EmojiReactions
