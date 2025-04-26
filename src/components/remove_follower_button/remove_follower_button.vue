<template>
  <button
    class="btn button-default follow-button"
    :class="{ toggled: inProgress }"
    :disabled="inProgress"
    :title="$t('user_card.remove_follower')"
    @click="onClick"
  >
    {{ label }}
    <teleport to="#modal">
      <confirm-modal
        v-if="showingConfirmRemoveFollower"
        :title="$t('user_card.remove_follower_confirm_title')"
        :confirm-text="$t('user_card.remove_follower_confirm_accept_button')"
        :cancel-text="$t('user_card.remove_follower_confirm_cancel_button')"
        @accepted="doRemoveUserFromFollowers"
        @cancelled="hideConfirmRemoveUserFromFollowers"
      >
        <i18n-t
          keypath="user_card.remove_follower_confirm"
          tag="span"
        >
          <template #user>
            <span
              v-text="user.screen_name_ui"
            />
          </template>
        </i18n-t>
      </confirm-modal>
    </teleport>
  </button>
</template>

<script src="./remove_follower_button.js"></script>
