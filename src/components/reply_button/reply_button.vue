<template>
  <div class="ReplyButton">
    <button
      v-if="loggedIn"
      class="button-unstyled interactive"
      :class="{'-active': replying}"
      :title="$t('tool_tip.reply')"
      @click.prevent="$emit('toggle')"
    >
      <FALayers class="fa-old-padding-layer">
        <FAIcon
          class="fa-scale-110"
          icon="reply"
        />
        <FAIcon
          v-if="!replying"
          class="focus-marker"
          transform="shrink-6 up-8 right-11"
          icon="plus"
        />
        <FAIcon
          v-else
          class="focus-marker"
          transform="shrink-6 up-8 right-11"
          icon="times"
        />
      </FALayers>
    </button>
    <a
      v-else
      class="button-unstyled interactive"
      target="_blank"
      role="button"
      :href="remoteInteractionLink"
      :title="$t('tool_tip.reply')"
    >
      <FALayers class="fa-old-padding-layer">
        <FAIcon
          class="fa-scale-110"
          icon="reply"
        />
        <FAIcon
          v-if="!replying"
          class="focus-marker"
          transform="shrink-6 up-8 right-16"
          icon="plus"
        />
      </FALayers>
    </a>
    <span
      v-if="status.replies_count > 0"
      class="action-counter"
    >
      {{ status.replies_count }}
    </span>
  </div>
</template>

<script src="./reply_button.js"></script>

<style lang="scss">
@import "../../variables";
@import "../../mixins";

.ReplyButton {
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
    &:hover .svg-inline--fa,
    &.-active .svg-inline--fa {
      color: $fallback--cBlue;
      color: var(--cBlue, $fallback--cBlue);
    }

    @include unfocused-style {
      .focus-marker {
        visibility: hidden;
      }
    }

    @include focused-style {
      .focus-marker {
        visibility: visible;
      }
    }
  }
}
</style>
