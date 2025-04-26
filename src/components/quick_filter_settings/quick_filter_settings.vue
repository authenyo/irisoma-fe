<template>
  <Popover
    trigger="click"
    class="QuickFilterSettings"
    :bound-to="{ x: 'container' }"
    :trigger-attrs="{ title: $t('timeline.quick_filter_settings') }"
  >
    <template #content>
      <div
        class="dropdown-menu"
        role="menu"
      >
        <div
          v-if="loggedIn"
          role="group"
        >
          <button
            v-if="!conversation"
            class="button-default dropdown-item"
            :aria-checked="replyVisibilityAll"
            role="menuitemradio"
            @click="replyVisibilityAll = true"
          >
            <span
              class="menu-checkbox -radio"
              :class="{ 'menu-checkbox-checked': replyVisibilityAll }"
              :aria-hidden="true"
            />{{ $t('settings.reply_visibility_all') }}
          </button>
          <button
            v-if="!conversation"
            class="button-default dropdown-item"
            :aria-checked="replyVisibilityFollowing"
            role="menuitemradio"
            @click="replyVisibilityFollowing = true"
          >
            <span
              class="menu-checkbox -radio"
              :class="{ 'menu-checkbox-checked': replyVisibilityFollowing }"
              :aria-hidden="true"
            />{{ $t('settings.reply_visibility_following_short') }}
          </button>
          <button
            v-if="!conversation"
            class="button-default dropdown-item"
            :aria-checked="replyVisibilitySelf"
            role="menuitemradio"
            @click="replyVisibilitySelf = true"
          >
            <span
              class="menu-checkbox -radio"
              :class="{ 'menu-checkbox-checked': replyVisibilitySelf }"
              :aria-hidden="true"
            />{{ $t('settings.reply_visibility_self_short') }}
          </button>
          <div
            v-if="!conversation"
            role="separator"
            class="dropdown-divider"
          />
        </div>
        <button
          class="button-default dropdown-item"
          role="menuitemcheckbox"
          :aria-checked="muteBotStatuses"
          @click="muteBotStatuses = !muteBotStatuses"
        >
          <span
            class="menu-checkbox"
            :class="{ 'menu-checkbox-checked': muteBotStatuses }"
            :aria-hidden="true"
          />{{ $t('settings.mute_bot_posts') }}
        </button>
        <button
          class="button-default dropdown-item"
          role="menuitemcheckbox"
          :aria-checked="hideMedia"
          @click="hideMedia = !hideMedia"
        >
          <span
            class="menu-checkbox"
            :class="{ 'menu-checkbox-checked': hideMedia }"
            :aria-hidden="true"
          />{{ $t('settings.hide_media_previews') }}
        </button>
        <button
          class="button-default dropdown-item"
          role="menuitemcheckbox"
          :aria-checked="hideMutedPosts"
          @click="hideMutedPosts = !hideMutedPosts"
        >
          <span
            class="menu-checkbox"
            :class="{ 'menu-checkbox-checked': hideMutedPosts }"
            :aria-hidden="true"
          />{{ $t('settings.hide_all_muted_posts') }}
        </button>
        <button
          class="button-default dropdown-item dropdown-item-icon"
          role="menuitem"
          @click="openTab('filtering')"
        >
          <FAIcon icon="font" />{{ $t('settings.word_filter_and_more') }}
        </button>
      </div>
    </template>
    <template #trigger>
      <FAIcon icon="filter" />
    </template>
  </Popover>
</template>

<script src="./quick_filter_settings.js"></script>
