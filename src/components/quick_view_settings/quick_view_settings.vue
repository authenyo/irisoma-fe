<template>
  <Popover
    trigger="click"
    class="QuickViewSettings"
    :bound-to="{ x: 'container' }"
    :trigger-attrs="{ title: $t('timeline.quick_view_settings') }"
  >
    <template #content>
      <div
        class="dropdown-menu"
        role="menu"
      >
        <div role="group">
          <button
            class="button-default dropdown-item"
            :aria-checked="conversationDisplay === 'tree'"
            role="menuitemradio"
            @click="conversationDisplay = 'tree'"
          >
            <span
              class="menu-checkbox -radio"
              :aria-hidden="true"
              :class="{ 'menu-checkbox-checked': conversationDisplay === 'tree' }"
            /><FAIcon
              icon="folder-tree"
              :aria-hidden="true"
            /> {{ $t('settings.conversation_display_tree_quick') }}
          </button>
          <button
            class="button-default dropdown-item"
            :aria-checked="conversationDisplay === 'linear'"
            role="menuitemradio"
            @click="conversationDisplay = 'linear'"
          >
            <span
              class="menu-checkbox -radio"
              :class="{ 'menu-checkbox-checked': conversationDisplay === 'linear' }"
              :aria-hidden="true"
            /><FAIcon
              icon="list"
              :aria-hidden="true"
            /> {{ $t('settings.conversation_display_linear_quick') }}
          </button>
        </div>
        <div
          role="separator"
          class="dropdown-divider"
        />
        <button
          class="button-default dropdown-item"
          role="menuitemcheckbox"
          :aria-checked="showUserAvatars"
          @click="showUserAvatars = !showUserAvatars"
        >
          <span
            class="menu-checkbox"
            :class="{ 'menu-checkbox-checked': showUserAvatars }"
            :aria-hidden="true"
          />{{ $t('settings.mention_link_show_avatar_quick') }}
        </button>
        <button
          v-if="!conversation"
          class="button-default dropdown-item"
          role="menuitemcheckbox"
          :aria-checked="autoUpdate"
          @click="autoUpdate = !autoUpdate"
        >
          <span
            class="menu-checkbox"
            :class="{ 'menu-checkbox-checked': autoUpdate }"
            :aria-hidden="true"
          />{{ $t('settings.auto_update') }}
        </button>
        <button
          v-if="!conversation"
          class="button-default dropdown-item"
          role="menuitemcheckbox"
          :aria-checked="collapseWithSubjects"
          @click="collapseWithSubjects = !collapseWithSubjects"
        >
          <span
            class="menu-checkbox"
            :class="{ 'menu-checkbox-checked': collapseWithSubjects }"
            :aria-hidden="true"
          />{{ $t('settings.collapse_subject') }}
        </button>
        <button
          class="button-default dropdown-item dropdown-item-icon"
          role="menuitem"
          @click="openTab('general')"
        >
          <FAIcon icon="wrench" />{{ $t('settings.more_settings') }}
        </button>
      </div>
    </template>
    <template #trigger>
      <FAIcon icon="bars" />
    </template>
  </Popover>
</template>

<script src="./quick_view_settings.js"></script>
