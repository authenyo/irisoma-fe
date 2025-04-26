<template>
  <Popover
    class="ExtraButtons"
    trigger="click"
    :trigger-attrs="triggerAttrs"
    placement="top"
    :offset="{ y: 5 }"
    :bound-to="{ x: 'container' }"
    remove-padding
    @show="onShow"
    @close="onClose"
  >
    <template #content="{close}">
      <div
        class="dropdown-menu"
        role="menu"
        :id="`popup-menu-${randomSeed}`"
      >
        <button
          v-if="canMute && !status.thread_muted"
          class="button-default dropdown-item dropdown-item-icon"
          role="menuitem"
          @click.prevent="muteConversation"
        >
          <FAIcon
            fixed-width
            icon="eye-slash"
          /><span>{{ $t("status.mute_conversation") }}</span>
        </button>
        <button
          v-if="canMute && status.thread_muted"
          class="button-default dropdown-item dropdown-item-icon"
          role="menuitem"
          @click.prevent="unmuteConversation"
        >
          <FAIcon
            fixed-width
            icon="eye-slash"
          /><span>{{ $t("status.unmute_conversation") }}</span>
        </button>
        <button
          v-if="!status.pinned && canPin"
          class="button-default dropdown-item dropdown-item-icon"
          role="menuitem"
          @click.prevent="pinStatus"
          @click="close"
        >
          <FAIcon
            fixed-width
            icon="thumbtack"
          /><span>{{ $t("status.pin") }}</span>
        </button>
        <button
          v-if="status.pinned && canPin"
          class="button-default dropdown-item dropdown-item-icon"
          role="menuitem"
          @click.prevent="unpinStatus"
          @click="close"
        >
          <FAIcon
            fixed-width
            icon="thumbtack"
          /><span>{{ $t("status.unpin") }}</span>
        </button>
        <template v-if="canBookmark">
          <button
            v-if="!status.bookmarked"
            class="button-default dropdown-item dropdown-item-icon"
            role="menuitem"
            @click.prevent="bookmarkStatus"
            @click="close"
          >
            <FAIcon
              fixed-width
              :icon="['far', 'bookmark']"
            /><span>{{ $t("status.bookmark") }}</span>
          </button>
          <button
            v-if="status.bookmarked"
            class="button-default dropdown-item dropdown-item-icon"
            role="menuitem"
            @click.prevent="unbookmarkStatus"
            @click="close"
          >
            <FAIcon
              fixed-width
              icon="bookmark"
            /><span>{{ $t("status.unbookmark") }}</span>
          </button>
        </template>
        <button
          v-if="ownStatus && editingAvailable"
          class="button-default dropdown-item dropdown-item-icon"
          role="menuitem"
          @click.prevent="editStatus"
          @click="close"
        >
          <FAIcon
            fixed-width
            icon="pen"
          /><span>{{ $t("status.edit") }}</span>
        </button>
        <button
          v-if="isEdited && editingAvailable"
          class="button-default dropdown-item dropdown-item-icon"
          role="menuitem"
          @click.prevent="showStatusHistory"
          @click="close"
        >
          <FAIcon
            fixed-width
            icon="history"
          /><span>{{ $t("status.status_history") }}</span>
        </button>
        <button
          v-if="canDelete"
          class="button-default dropdown-item dropdown-item-icon"
          role="menuitem"
          @click.prevent="deleteStatus"
          @click="close"
        >
          <FAIcon
            fixed-width
            icon="times"
          /><span>{{ $t("status.delete") }}</span>
        </button>
        <button
          class="button-default dropdown-item dropdown-item-icon"
          role="menuitem"
          @click.prevent="copyLink"
          @click="close"
        >
          <FAIcon
            fixed-width
            icon="share-alt"
          /><span>{{ $t("status.copy_link") }}</span>
        </button>
        <a
          v-if="!status.is_local"
          class="button-default dropdown-item dropdown-item-icon"
          role="menuitem"
          title="Source"
          :href="status.external_url"
          target="_blank"
        >
          <FAIcon
            fixed-width
            icon="external-link-alt"
          /><span>{{ $t("status.external_source") }}</span>
        </a>
        <button
          class="button-default dropdown-item dropdown-item-icon"
          role="menuitem"
          @click.prevent="reportStatus"
          @click="close"
        >
          <FAIcon
            fixed-width
            :icon="['far', 'flag']"
          /><span>{{ $t("user_card.report") }}</span>
        </button>
      </div>
    </template>
    <template #trigger>
      <span class="button-unstyled popover-trigger">
        <FALayers class="fa-old-padding-layer">
          <FAIcon
            class="fa-scale-110 "
            icon="ellipsis-h"
          />
          <FAIcon
            v-show="!expanded"
            class="focus-marker"
            transform="shrink-6 up-8 right-16"
            icon="plus"
          />
          <FAIcon
            v-show="expanded"
            class="focus-marker"
            transform="shrink-6 up-8 right-16"
            icon="times"
          />
        </FALayers>
      </span>
      <teleport to="#modal">
        <ConfirmModal
          v-if="showingDeleteDialog"
          :title="$t('status.delete_confirm_title')"
          :cancel-text="$t('status.delete_confirm_cancel_button')"
          :confirm-text="$t('status.delete_confirm_accept_button')"
          @cancelled="hideDeleteStatusConfirmDialog"
          @accepted="doDeleteStatus"
        >
          {{ $t('status.delete_confirm') }}
        </ConfirmModal>
      </teleport>
    </template>
  </Popover>
</template>

<script src="./extra_buttons.js"></script>

<style lang="scss">
@import "../../variables";
@import "../../mixins";

.ExtraButtons {
  .popover-trigger {
    position: static;
    padding: 10px;
    margin: -10px;

    &:hover .svg-inline--fa {
      color: $fallback--text;
      color: var(--text, $fallback--text);
    }
  }

  .popover-trigger-button {
    /* override of popover internal stuff */
    width: auto;

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
