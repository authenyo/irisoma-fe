<template>
  <div class="RetweetButton">
    <button
      v-if="visibility !== 'private' && visibility !== 'direct' && loggedIn"
      class="button-unstyled interactive"
      :class="status.repeated && '-repeated'"
      :title="$t('tool_tip.repeat')"
      @click.prevent="retweet()"
    >
      <FALayers class="fa-old-padding-layer">
        <FAIcon
          class="fa-scale-110"
          icon="retweet"
          :spin="animated"
        />
        <FAIcon
          v-if="status.repeated"
          class="active-marker"
          transform="shrink-6 up-9 right-12"
          icon="check"
        />
        <FAIcon
          v-if="!status.repeated"
          class="focus-marker"
          transform="shrink-6 up-9 right-12"
          icon="plus"
        />
        <FAIcon
          v-else
          class="focus-marker"
          transform="shrink-6 up-9 right-12"
          icon="minus"
        />
      </FALayers>
    </button>
    <span v-else-if="loggedIn">
      <FAIcon
        class="fa-scale-110 fa-old-padding"
        icon="lock"
        :title="$t('timeline.no_retweet_hint')"
      />
    </span>
    <a
      v-else
      class="button-unstyled interactive"
      target="_blank"
      role="button"
      :title="$t('tool_tip.repeat')"
      :href="remoteInteractionLink"
    >
      <FALayers class="fa-old-padding-layer">
        <FAIcon
          class="fa-scale-110"
          icon="retweet"
        />
        <FAIcon
          class="focus-marker"
          transform="shrink-6 up-9 right-12"
          icon="plus"
        />
      </FALayers>
    </a>
    <span
      v-if="!mergedConfig.hidePostStats && status.repeat_num > 0"
      class="no-event"
    >
      {{ status.repeat_num }}
    </span>
    <teleport to="#modal">
      <confirm-modal
        v-if="showingConfirmDialog"
        :title="$t('status.repeat_confirm_title')"
        :confirm-text="$t('status.repeat_confirm_accept_button')"
        :cancel-text="$t('status.repeat_confirm_cancel_button')"
        @accepted="doRetweet"
        @cancelled="hideConfirmDialog"
      >
        {{ $t('status.repeat_confirm') }}
      </confirm-modal>
    </teleport>
  </div>
</template>

<script src="./retweet_button.js"></script>

<style lang="scss">
@import "../../variables";
@import "../../mixins";

.RetweetButton {
  display: flex;

  > :first-child {
    padding: 10px;
    margin: -10px -8px -10px -10px;
  }

  .action-counter {
    pointer-events: none;
    user-select: none;
  }

  .interactive {
    .svg-inline--fa {
      animation-duration: 0.6s;
    }

    &:hover .svg-inline--fa,
    &.-repeated .svg-inline--fa {
      color: $fallback--cGreen;
      color: var(--cGreen, $fallback--cGreen);
    }

    @include unfocused-style {
      .focus-marker {
        visibility: hidden;
      }

      .active-marker {
        visibility: visible;
      }
    }

    @include focused-style {
      .focus-marker {
        visibility: visible;
      }

      .active-marker {
        visibility: hidden;
      }
    }
  }
}
</style>
