<template>
  <div class="FavoriteButton">
    <button
      v-if="loggedIn"
      class="button-unstyled interactive"
      :class="status.favorited && '-favorited'"
      :title="$t('tool_tip.favorite')"
      @click.prevent="favorite()"
    >
      <FALayers class="fa-scale-110 fa-old-padding-layer">
        <FAIcon
          class="fa-scale-110"
          :icon="[status.favorited ? 'fas' : 'far', 'star']"
          :spin="animated"
        />
        <FAIcon
          v-if="status.favorited"
          class="active-marker"
          transform="shrink-6 up-9 right-12"
          icon="check"
        />
        <FAIcon
          v-if="!status.favorited"
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
    <a
      v-else
      class="button-unstyled interactive"
      target="_blank"
      role="button"
      :title="$t('tool_tip.favorite')"
      :href="remoteInteractionLink"
    >
      <FALayers class="fa-scale-110 fa-old-padding-layer">
        <FAIcon
          class="fa-scale-110"
          :icon="['far', 'star']"
        />
        <FAIcon
          class="focus-marker"
          transform="shrink-6 up-9 right-12"
          icon="plus"
        />
      </FALayers>
    </a>
    <span
      v-if="!mergedConfig.hidePostStats && status.fave_num > 0"
      class="action-counter"
    >
      {{ status.fave_num }}
    </span>
  </div>
</template>

<script src="./favorite_button.js"></script>

<style lang="scss">
@import "../../variables";
@import "../../mixins";

.FavoriteButton {
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
    &.-favorited .svg-inline--fa {
      color: $fallback--cOrange;
      color: var(--cOrange, $fallback--cOrange);
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
