<template>
  <nav
    id="nav"
    class="DesktopNav"
    :class="{ '-logoLeft': logoLeft }"
    @click="scrollToTop()"
  >
    <div class="inner-nav">
      <div class="item sitename">
        <router-link
          v-if="!hideSitename"
          class="site-name"
          :to="{ name: 'root' }"
          active-class="home"
        >
          {{ sitename }}
        </router-link>
      </div>
      <router-link
        class="logo"
        :to="{ name: 'root' }"
        :style="logoBgStyle"
        :title="sitename"
      >
        <div
          class="mask"
          :style="logoMaskStyle"
        />
        <img
          :src="logo"
          :style="logoStyle"
        >
      </router-link>
      <div class="item right actions">
        <search-bar
          v-if="currentUser || !privateMode"
          @toggled="onSearchBarToggled"
          @click.stop
        />
        <button
          class="button-unstyled nav-icon"
          :title="$t('nav.preferences')"
          @click.stop="openSettingsModal"
        >
          <FAIcon
            fixed-width
            class="fa-scale-110 fa-old-padding"
            icon="cog"
          />
        </button>
        <button
          v-if="currentUser && currentUser.role === 'admin'"
          class="button-unstyled nav-icon"
          target="_blank"
          :title="$t('nav.administration')"
          @click.stop="openAdminModal"
        >
          <FAIcon
            fixed-width
            class="fa-scale-110 fa-old-padding"
            icon="tachometer-alt"
          />
        </button>
        <span class="spacer" />
        <button
          v-if="currentUser"
          class="button-unstyled nav-icon"
          :title="$t('login.logout')"
          @click.stop.prevent="logout"
        >
          <FAIcon
            fixed-width
            class="fa-scale-110 fa-old-padding"
            icon="sign-out-alt"
          />
        </button>
      </div>
    </div>
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
  </nav>
</template>
<script src="./desktop_nav.js"></script>

<style src="./desktop_nav.scss" lang="scss"></style>
