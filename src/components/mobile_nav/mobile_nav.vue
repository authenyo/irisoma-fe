<template>
  <div
    class="MobileNav"
  >
    <nav
      id="nav"
      class="mobile-nav"
      @click="scrollToTop()"
    >
      <div class="item">
        <button
          class="button-unstyled mobile-nav-button"
          :title="$t('nav.mobile_sidebar')"
          :aria-expanaded="$refs.sideDrawer && !$refs.sideDrawer.closed"
          @click.stop.prevent="toggleMobileSidebar()"
        >
          <FAIcon
            class="fa-scale-110 fa-old-padding"
            icon="bars"
          />
          <div
            v-if="(unreadChatCount && !chatsPinned) || unreadAnnouncementCount"
            class="alert-dot"
          />
        </button>
        <NavigationPins class="pins" />
      </div> <div class="item right">
        <button
          v-if="currentUser"
          class="button-unstyled mobile-nav-button"
          :title="unseenNotificationsCount ? $t('nav.mobile_notifications_unread_active') : $t('nav.mobile_notifications')"
          @click.stop.prevent="openMobileNotifications()"
        >
          <FAIcon
            class="fa-scale-110 fa-old-padding"
            icon="bell"
          />
          <div
            v-if="unseenNotificationsCount"
            class="alert-dot"
          />
        </button>
      </div>
    </nav>
    <aside
      v-if="currentUser"
      class="mobile-notifications-drawer"
      :class="{ '-closed': !notificationsOpen }"
      @touchstart.stop="notificationsTouchStart"
      @touchmove.stop="notificationsTouchMove"
    >
      <div class="mobile-notifications-header">
        <span class="title">{{ $t('notifications.notifications') }}</span>
        <span class="spacer" />
        <button
          v-if="notificationsAtTop"
          class="button-unstyled mobile-nav-button"
          :title="$t('general.scroll_to_top')"
          @click.stop.prevent="scrollMobileNotificationsToTop"
        >
          <FALayers class="fa-scale-110 fa-old-padding-layer">
            <FAIcon icon="arrow-up" />
            <FAIcon
              icon="minus"
              transform="up-7"
            />
          </FALayers>
        </button>
        <button
          class="button-unstyled mobile-nav-button"
          :title="$t('nav.mobile_notifications_close')"
          @click.stop.prevent="closeMobileNotifications(true)"
        >
          <FAIcon
            class="fa-scale-110 fa-old-padding"
            icon="times"
          />
        </button>
      </div>
      <div
        id="mobile-notifications"
        ref="mobileNotifications"
        class="mobile-notifications"
        @scroll="onScroll"
      />
    </aside>
    <SideDrawer
      ref="sideDrawer"
      :logout="logout"
    />
    <teleport to="#modal">
      <confirm-modal
        v-if="showingConfirmLogout"
        :title="$t('login.logout_confirm_title')"
        :confirm-text="$t('login.logout_confirm_accept_button')"
        :cancel-text="$t('login.logout_confirm_cancel_button')"
        @accepted="doLogout"
        @cancelled="hideConfirmLogout"
      >
        {{ $t('login.logout_confirm') }}
      </confirm-modal>
    </teleport>
  </div>
</template>

<script src="./mobile_nav.js"></script>

<style lang="scss">
@import "../../variables";

.MobileNav {
  z-index: var(--ZI_navbar);

  .mobile-nav {
    display: grid;
    line-height: var(--navbar-height);
    grid-template-rows: 50px;
    grid-template-columns: 2fr auto;
    width: 100%;
    box-sizing: border-box;

    a {
      color: var(--topBarLink, $fallback--link);
    }
  }

  .mobile-inner-nav {
    width: 100%;
    display: flex;
    align-items: center;
  }

  .mobile-nav-button {
    display: inline-block;
    text-align: center;
    padding: 0 1em;
    position: relative;
    cursor: pointer;
  }

  .site-name {
    padding: 0 0.3em;
    display: inline-block;
  }

  .item {
    /* moslty just to get rid of extra whitespaces */
    display: flex;
  }

  .alert-dot {
    border-radius: 100%;
    height: 8px;
    width: 8px;
    position: absolute;
    left: calc(50% - 4px);
    top: calc(50% - 4px);
    margin-left: 6px;
    margin-top: -6px;
    background-color: $fallback--cRed;
    background-color: var(--badgeNotification, $fallback--cRed);
  }

  .mobile-notifications-drawer {
    width: 100%;
    height: 100vh;
    overflow-x: hidden;
    position: fixed;
    top: 0;
    left: 0;
    box-shadow: 1px 1px 4px rgb(0 0 0 / 60%);
    box-shadow: var(--panelShadow);
    transition-property: transform;
    transition-duration: 0.25s;
    transform: translateX(0);
    z-index: var(--ZI_navbar);
    -webkit-overflow-scrolling: touch;

    &.-closed {
      transform: translateX(100%);
      box-shadow: none;
    }
  }

  .mobile-notifications-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: calc(var(--ZI_navbar) + 100);
    width: 100%;
    height: 50px;
    line-height: 50px;
    position: absolute;
    color: var(--topBarText);
    background-color: $fallback--fg;
    background-color: var(--topBar, $fallback--fg);
    box-shadow: 0 0 4px rgb(0 0 0 / 60%);
    box-shadow: var(--topBarShadow);

    .spacer {
      flex: 1;
    }

    .title {
      font-size: 1.3em;
      margin-left: 0.6em;
    }
  }

  .pins {
    flex: 1;

    .pinned-item {
      flex-grow: 1;
    }
  }

  .mobile-notifications {
    margin-top: 50px;
    width: 100vw;
    height: calc(100vh - var(--navbar-height));
    overflow-x: hidden;
    overflow-y: scroll;
    color: $fallback--text;
    color: var(--text, $fallback--text);
    background-color: $fallback--bg;
    background-color: var(--bg, $fallback--bg);

    .notifications {
      padding: 0;
      border-radius: 0;
      box-shadow: none;

      .panel {
        border-radius: 0;
        margin: 0;
        box-shadow: none;
      }

      .panel::after {
        border-radius: 0;
      }

      .panel .panel-heading {
        border-radius: 0;
        box-shadow: none;
      }
    }
  }

  .confirm-modal.dark-overlay {
    &::before {
      z-index: 3000;
    }

    .dialog-modal.panel {
      z-index: 3001;
    }
  }
}

</style>
