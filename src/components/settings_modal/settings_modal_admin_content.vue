<template>
  <tab-switcher
    v-if="adminDescriptionsLoaded && (noDb || adminDbLoaded)"
    ref="tabSwitcher"
    class="settings_tab-switcher"
    :side-tab-bar="true"
    :scrollable-tabs="true"
    :render-only-focused="true"
    :body-scroll-lock="bodyLock"
  >
    <div
      v-if="noDb"
      :label="$t('admin_dash.tabs.nodb')"
      icon="exclamation-triangle"
      data-tab-name="nodb-notice"
    >
      <div :label="$t('admin_dash.tabs.nodb')">
        <div class="setting-item">
          <h2>{{ $t('admin_dash.nodb.heading') }}</h2>
          <i18n-t keypath="admin_dash.nodb.text">
            <template #documentation>
              <a
                href="https://docs-develop.pleroma.social/backend/configuration/howto_database_config/"
                target="_blank"
              >
                {{ $t("admin_dash.nodb.documentation") }}
              </a>
            </template>
            <template #property>
              <code>config :pleroma, configurable_from_database</code>
            </template>
            <template #value>
              <code>true</code>
            </template>
          </i18n-t>
          <p>{{ $t('admin_dash.nodb.text2') }}</p>
        </div>
      </div>
    </div>
    <div
      v-if="adminDbLoaded"
      :label="$t('admin_dash.tabs.instance')"
      icon="wrench"
      data-tab-name="general"
    >
      <InstanceTab />
    </div>
    <div
      v-if="adminDbLoaded"
      :label="$t('admin_dash.tabs.limits')"
      icon="hand"
      data-tab-name="limits"
    >
      <LimitsTab />
    </div>
    <div
      :label="$t('admin_dash.tabs.frontends')"
      icon="laptop-code"
      data-tab-name="frontends"
    >
      <FrontendsTab />
    </div>
  </tab-switcher>
</template>

<script src="./settings_modal_admin_content.js"></script>

<style src="./settings_modal_admin_content.scss" lang="scss"></style>
