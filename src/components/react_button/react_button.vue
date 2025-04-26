<template>
  <span class="ReactButton">
    <EmojiPicker
      ref="picker"
      :enable-sticker-picker="enableStickerPicker"
      :hide-custom-emoji="hideCustomEmoji"
      class="emoji-picker-panel"
      @emoji="addReaction"
      @show="onShow"
      @close="onClose"
    />
    <span
      class="button-unstyled popover-trigger"
      role="button"
      :tabindex="0"
      :title="$t('tool_tip.add_reaction')"
      @click.stop.prevent="show"
    >
      <FALayers>
        <FAIcon
          class="fa-scale-110 fa-old-padding"
          :icon="['far', 'smile-beam']"
        />
        <FAIcon
          v-show="!expanded"
          class="focus-marker"
          transform="shrink-6 up-9 right-17"
          icon="plus"
        />
        <FAIcon
          v-show="expanded"
          class="focus-marker"
          transform="shrink-6 up-9 right-17"
          icon="times"
        />
      </FALayers>
    </span>
  </span>
</template>

<script src="./react_button.js"></script>

<style lang="scss">
@import "../../variables";
@import "../../mixins";

.ReactButton {
  .reaction-picker-filter {
    padding: 0.5em;
    display: flex;

    input {
      flex: 1;
    }
  }

  .reaction-picker-divider {
    height: 1px;
    width: 100%;
    margin: 0.5em;
    background-color: var(--border, $fallback--border);
  }

  .reaction-picker {
    width: 10em;
    height: 9em;
    font-size: 1.5em;
    overflow-y: scroll;
    display: flex;
    flex-wrap: wrap;
    padding: 0.5em;
    text-align: center;
    align-content: flex-start;
    user-select: none;
    mask:
      linear-gradient(to top, white 0, transparent 100%) bottom no-repeat,
      linear-gradient(to bottom, white 0, transparent 100%) top no-repeat,
      linear-gradient(to top, white, white);
    transition: mask-size 150ms;
    mask-size: 100% 20px, 100% 20px, auto;

    /* Autoprefixed seem to ignore this one, and also syntax is different */
    mask-composite: xor;
    mask-composite: exclude;

    .emoji-button {
      cursor: pointer;
      flex-basis: 20%;
      line-height: 1.5;
      align-content: center;

      &:hover {
        transform: scale(1.25);
      }
    }
  }

  .popover-trigger {
    padding: 10px;
    margin: -10px;

    &:hover .svg-inline--fa {
      color: $fallback--text;
      color: var(--text, $fallback--text);
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
