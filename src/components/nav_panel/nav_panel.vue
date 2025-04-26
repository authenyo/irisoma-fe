<template>
  <div class="NavPanel">
    <div class="panel panel-default">
      <div
        v-if="!forceExpand"
        class="panel-heading nav-panel-heading"
      >
        <NavigationPins :limit="6" />
        <div class="spacer" />
        <button
          class="button-unstyled"
          @click="toggleCollapse"
        >
          <FAIcon
            class="navigation-chevron"
            fixed-width
            :icon="collapsed ? 'chevron-down' : 'chevron-up'"
          />
        </button>
      </div>
      <ul
        v-if="!collapsed || forceExpand"
        class="panel-body"
      >
        <NavigationEntry
          v-if="currentUser || !privateMode"
          :show-pin="false"
          :item="{ icon: 'stream', label: 'nav.timelines' }"
          :aria-expanded="showTimelines ? 'true' : 'false'"
          @click="toggleTimelines"
        >
          <FAIcon
            class="timelines-chevron"
            fixed-width
            :icon="showTimelines ? 'chevron-up' : 'chevron-down'"
          />
        </NavigationEntry>
        <div
          v-show="showTimelines"
          class="timelines-background"
        >
          <div class="timelines">
            <NavigationEntry
              v-for="item in timelinesItems"
              :key="item.name"
              :show-pin="editMode || forceEditMode"
              :item="item"
            />
          </div>
        </div>
        <NavigationEntry
          v-if="currentUser"
          :show-pin="false"
          :item="{ icon: 'list', label: 'nav.lists' }"
          :aria-expanded="showLists ? 'true' : 'false'"
          @click="toggleLists"
        >
          <router-link
            :title="$t('lists.manage_lists')"
            class="extra-button"
            :to="{ name: 'lists' }"
            @click.stop
          >
            <FAIcon
              class="extra-button"
              fixed-width
              icon="wrench"
            />
          </router-link>
          <FAIcon
            class="timelines-chevron"
            fixed-width
            :icon="showLists ? 'chevron-up' : 'chevron-down'"
          />
        </NavigationEntry>
        <div
          v-show="showLists"
          class="timelines-background"
        >
          <ListsMenuContent
            :show-pin="editMode || forceEditMode"
            class="timelines"
          />
        </div>
        <NavigationEntry
          v-for="item in rootItems"
          :key="item.name"
          :show-pin="editMode || forceEditMode"
          :item="item"
        />
        <NavigationEntry
          v-if="!forceEditMode && currentUser"
          :show-pin="false"
          :item="{ label: editMode ? $t('nav.edit_finish') : $t('nav.edit_pinned'), icon: editMode ? 'check' : 'wrench' }"
          @click="toggleEditMode"
        />
      </ul>
    </div>
  </div>
</template>

<script src="./nav_panel.js"></script>

<style lang="scss">
@import "../../variables";

.NavPanel {
  .panel {
    overflow: hidden;
    box-shadow: var(--panelShadow);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    position: relative;
    border-bottom: 1px solid;
    border-color: $fallback--border;
    border-color: var(--border, $fallback--border);
  }

  > li {
    &:first-child .menu-item {
      border-top-right-radius: $fallback--panelRadius;
      border-top-right-radius: var(--panelRadius, $fallback--panelRadius);
      border-top-left-radius: $fallback--panelRadius;
      border-top-left-radius: var(--panelRadius, $fallback--panelRadius);
    }

    &:last-child .menu-item {
      border-bottom-right-radius: $fallback--panelRadius;
      border-bottom-right-radius: var(--panelRadius, $fallback--panelRadius);
      border-bottom-left-radius: $fallback--panelRadius;
      border-bottom-left-radius: var(--panelRadius, $fallback--panelRadius);
    }
  }

  li:last-child {
    border: none;
  }

  .navigation-chevron {
    margin-left: 0.8em;
    margin-right: 0.8em;
    font-size: 1.1em;
  }

  .timelines-chevron {
    margin-left: 0.8em;
    font-size: 1.1em;
  }

  .timelines-background {
    padding: 0 0 0 0.6em;
    background-color: $fallback--lightBg;
    background-color: var(--selectedMenu, $fallback--lightBg);
    border-bottom: 1px solid;
    border-color: $fallback--border;
    border-color: var(--border, $fallback--border);
  }

  .timelines {
    background-color: $fallback--bg;
    background-color: var(--bg, $fallback--bg);
  }

  .nav-panel-heading {
    // breaks without a unit
    // stylelint-disable-next-line length-zero-no-unit
    --panel-heading-height-padding: 0px;
  }
}
</style>
