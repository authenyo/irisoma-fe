<template>
  <OptionalRouterLink
    v-slot="{ isActive, href, navigate } = {}"
    ass="ass"
    :to="routeTo"
  >
    <li
      class="NavigationEntry menu-item"
      :class="{ '-active': isActive }"
      v-bind="$attrs"
    >
      <component
        :is="routeTo ? 'a' : 'button'"
        class="main-link button-unstyled"
        :href="href"
        @click="navigate"
      >
        <span>
          <FAIcon
            v-if="item.icon"
            fixed-width
            class="fa-scale-110 menu-icon"
            :icon="item.icon"
          />
        </span>
        <span
          v-if="item.iconLetter"
          class="icon iconLetter fa-scale-110 menu-icon"
        >{{ item.iconLetter }}
        </span>
        <span class="label">
          {{ item.labelRaw || $t(item.label) }}
        </span>
      </component>
      <slot />
      <div
        v-if="item.badgeGetter && getters[item.badgeGetter]"
        class="badge badge-notification"
      >
        {{ getters[item.badgeGetter] }}
      </div>
      <button
        v-if="showPin && currentUser"
        type="button"
        class="button-unstyled extra-button"
        :title="$t(isPinned ? 'general.unpin' : 'general.pin' )"
        :aria-pressed="!!isPinned"
        @click.stop.prevent="togglePin(item.name)"
      >
        <FAIcon
          v-if="showPin && currentUser"
          fixed-width
          class="fa-scale-110"
          :class="{ 'veryfaint': !isPinned(item.name) }"
          :transform="!isPinned(item.name) ? 'rotate-45' : ''"
          icon="thumbtack"
        />
      </button>
    </li>
  </OptionalRouterLink>
</template>

<script src="./navigation_entry.js"></script>

<style lang="scss">
@import "../../variables";

.NavigationEntry {
  display: flex;
  box-sizing: border-box;
  align-items: baseline;
  height: 3.5em;
  line-height: 3.5em;
  padding: 0 1em;
  width: 100%;
  color: $fallback--link;
  color: var(--link, $fallback--link);

  .timelines-chevron {
    margin-right: 0;
  }

  .main-link {
    flex: 1;
  }

  .menu-icon {
    margin-right: 0.8em;
  }

  .extra-button {
    width: 3em;
    text-align: center;

    &:last-child {
      margin-right: -0.8em;
    }
  }

  &:hover {
    background-color: $fallback--lightBg;
    background-color: var(--selectedMenu, $fallback--lightBg);
    color: $fallback--link;
    color: var(--selectedMenuText, $fallback--link);

    --faint: var(--selectedMenuFaintText, $fallback--faint);
    --faintLink: var(--selectedMenuFaintLink, $fallback--faint);
    --lightText: var(--selectedMenuLightText, $fallback--lightText);

    .menu-icon {
      --icon: var(--text, $fallback--icon);
    }
  }

  &.-active {
    font-weight: bolder;
    background-color: $fallback--lightBg;
    background-color: var(--selectedMenu, $fallback--lightBg);
    color: $fallback--text;
    color: var(--selectedMenuText, $fallback--text);

    --faint: var(--selectedMenuFaintText, $fallback--faint);
    --faintLink: var(--selectedMenuFaintLink, $fallback--faint);
    --lightText: var(--selectedMenuLightText, $fallback--lightText);

    .menu-icon {
      --icon: var(--text, $fallback--icon);
    }

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
