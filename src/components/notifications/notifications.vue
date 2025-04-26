<template>
  <teleport
    :disabled="minimalMode || disableTeleport"
    :to="teleportTarget"
  >
    <component
      :is="noHeading ? 'div' : 'aside'"
      ref="root"
      :class="{ minimal: minimalMode }"
      class="Notifications"
    >
      <div :class="mainClass">
        <div
          v-if="!noHeading"
          class="notifications-heading panel-heading -sticky"
        >
          <div class="title">
            {{ $t('notifications.notifications') }}
            <span
              v-if="unseenCount"
              class="badge badge-notification unseen-count"
            >{{ unseenCount }}</span>
          </div>
          <div
            v-if="showScrollTop"
            class="rightside-button"
          >
            <button
              class="button-unstyled scroll-to-top-button"
              type="button"
              :title="$t('general.scroll_to_top')"
              @click="scrollToTop"
            >
              <FALayers class="fa-scale-110 fa-old-padding-layer">
                <FAIcon icon="arrow-up" />
                <FAIcon
                  icon="minus"
                  transform="up-7"
                />
              </FALayers>
            </button>
          </div>
          <button
            v-if="unseenCount"
            class="button-default read-button"
            type="button"
            @click.prevent="markAsSeen"
          >
            {{ $t('notifications.read') }}
          </button>
          <NotificationFilters class="rightside-button" />
        </div>
        <div
          class="panel-body"
          role="feed"
        >
          <div
            v-for="notification in notificationsToDisplay"
            :key="notification.id"
            role="listitem"
            class="notification"
            :class="{unseen: !minimalMode && !notification.seen}"
          >
            <div class="notification-overlay" />
            <notification :notification="notification" />
          </div>
        </div>
        <div class="panel-footer">
          <div
            v-if="bottomedOut"
            class="new-status-notification text-center faint"
          >
            {{ $t('notifications.no_more_notifications') }}
          </div>
          <button
            v-else-if="!loading"
            class="button-unstyled -link -fullwidth"
            @click.prevent="fetchOlderNotifications()"
          >
            <div class="new-status-notification text-center">
              {{ minimalMode ? $t('interactions.load_older') : $t('notifications.load_older') }}
            </div>
          </button>
          <div
            v-else
            class="new-status-notification text-center"
          >
            <FAIcon
              icon="circle-notch"
              spin
              size="lg"
            />
          </div>
        </div>
      </div>
    </component>
  </teleport>
</template>

<script src="./notifications.js"></script>
<style lang="scss" src="./notifications.scss"></style>
