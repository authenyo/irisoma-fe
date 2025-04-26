<template>
  <div class="EmojiReactions">
    <span
      v-for="(reaction) in emojiReactions"
      :key="reaction.url || reaction.name"
      class="emoji-reaction-container btn-group"
    >
      <component
        :is="loggedIn ? 'button' : 'a'"
        v-bind="!loggedIn ? { href: remoteInteractionLink } : {}"
        role="button"
        class="emoji-reaction btn button-default"
        :class="{ '-picked-reaction': reactedWith(reaction.name) }"
        :title="reaction.url ? reaction.name : undefined"
        :aria-pressed="reactedWith(reaction.name)"
        @click="emojiOnClick(reaction.name, $event)"
      >
        <span
          class="reaction-emoji"
        >
          <img
            v-if="reaction.url"
            :src="reaction.url"
            class="reaction-emoji-content"
            width="1em"
          >
          <span
            v-else
            class="reaction-emoji reaction-emoji-content"
          >{{ reaction.name }}</span>
        </span>
        <FALayers>
          <FAIcon
            v-if="reactedWith(reaction.name)"
            class="active-marker"
            transform="shrink-6 up-9"
            icon="check"
          />
          <FAIcon
            v-if="!reactedWith(reaction.name)"
            class="focus-marker"
            transform="shrink-6 up-9"
            icon="plus"
          />
          <FAIcon
            v-else
            class="focus-marker"
            transform="shrink-6 up-9"
            icon="minus"
          />
        </FALayers>
      </component>
      <UserListPopover
        :users="accountsForEmoji[reaction.name]"
        class="emoji-reaction-popover"
        :trigger-attrs="counterTriggerAttrs(reaction)"
        @show="fetchEmojiReactionsByIfMissing()"
      >
        <span class="emoji-reaction-counts">{{ reaction.count }}</span>
      </UserListPopover>
    </span>
    <a
      v-if="tooManyReactions"
      class="emoji-reaction-expand faint"
      href="javascript:void(0)"
      @click="toggleShowAll"
    >
      {{ showAll ? $t('general.show_less') : showMoreString }}
    </a>
  </div>
</template>

<script src="./emoji_reactions.js"></script>
<style lang="scss">
@import "../../variables";
@import "../../mixins";

.EmojiReactions {
  display: flex;
  margin-top: 0.25em;
  flex-wrap: wrap;

  --emoji-size: calc(1.25em * var(--emojiReactionsScale, 1));

  .emoji-reaction-container {
    display: flex;
    align-items: stretch;
    margin-top: 0.5em;
    margin-right: 0.5em;

    .emoji-reaction-popover {
      padding: 0;

      .emoji-reaction-count-button {
        background-color: var(--btn);
        margin: 0;
        height: 100%;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        box-sizing: border-box;
        min-width: 2em;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        color: $fallback--text;
        color: var(--btnText, $fallback--text);

        &.-picked-reaction {
          border: 1px solid var(--accent, $fallback--link);
          margin-right: -1px;
        }
      }
    }
  }

  .emoji-reaction {
    padding-left: 0.5em;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    margin: 0;

    .reaction-emoji {
      width: var(--emoji-size);
      height: var(--emoji-size);
      margin-right: 0.25em;
      line-height: var(--emoji-size);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .reaction-emoji-content {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      line-height: inherit;
      overflow: hidden;
      font-size: calc(var(--emoji-size) * 0.8);
      margin: 0;
    }

    &:focus {
      outline: none;
    }

    .svg-inline--fa {
      color: $fallback--text;
      color: var(--btnText, $fallback--text);
    }

    &.-picked-reaction {
      border: 1px solid var(--accent, $fallback--link);
      margin-left: -1px; // offset the border, can't use inset shadows either
      margin-right: -1px;

      .svg-inline--fa {
        color: $fallback--link;
        color: var(--accent, $fallback--link);
      }
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
      .svg-inline--fa {
        color: $fallback--link;
        color: var(--accent, $fallback--link);
      }

      .focus-marker {
        visibility: visible;
      }

      .active-marker {
        visibility: hidden;
      }
    }
  }

  .emoji-reaction-expand {
    padding: 0 0.5em;
    margin-right: 0.5em;
    margin-top: 0.5em;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
