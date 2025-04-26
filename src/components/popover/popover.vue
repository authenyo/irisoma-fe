<template>
  <span
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
  >
    <button
      ref="trigger"
      class="popover-trigger-button"
      :class="normalButton ? 'button-default btn' : 'button-unstyled'"
      type="button"
      v-bind="triggerAttrs"
      @click="onClick"
    >
      <slot name="trigger" />
    </button>
    <teleport
      :disabled="!teleport"
      to="#popovers"
    >
      <transition name="fade">
        <div
          v-if="!hidden"
          ref="content"
          :style="styles"
          class="popover"
          :class="popoverClass || 'popover-default'"
          @mouseenter="onMouseenterContent"
          @mouseleave="onMouseleaveContent"
          @click="onClickContent"
        >
          <slot
            name="content"
            class="popover-inner"
            :close="hidePopover"
          />
        </div>
      </transition>
    </teleport>
  </span>
</template>

<script src="./popover.js" />

<style lang="scss">
@import "../../variables";

.popover-trigger-button {
  display: inline-block;
}

.popover {
  z-index: var(--ZI_popover_override, var(--ZI_popovers));
  position: fixed;
  min-width: 0;
  max-width: calc(100vw - 20px);
  box-shadow: 2px 2px 3px rgb(0 0 0 / 50%);
  box-shadow: var(--popupShadow);
}

.popover-default {
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 3;
    box-shadow: 1px 1px 4px rgb(0 0 0 / 60%);
    box-shadow: var(--panelShadow);
    pointer-events: none;
  }

  border-radius: $fallback--btnRadius;
  border-radius: var(--btnRadius, $fallback--btnRadius);
  background-color: $fallback--bg;
  background-color: var(--popover, $fallback--bg);
  color: $fallback--text;
  color: var(--popoverText, $fallback--text);

  --faint: var(--popoverFaintText, $fallback--faint);
  --faintLink: var(--popoverFaintLink, $fallback--faint);
  --lightText: var(--popoverLightText, $fallback--lightText);
  --postLink: var(--popoverPostLink, $fallback--link);
  --postFaintLink: var(--popoverPostFaintLink, $fallback--link);
  --icon: var(--popoverIcon, $fallback--icon);
}

.dropdown-menu {
  display: block;
  padding: 0.5rem 0;
  font-size: 1em;
  text-align: left;
  list-style: none;
  max-width: 100vw;
  z-index: var(--ZI_popover_override, var(--ZI_popovers));
  white-space: nowrap;

  .dropdown-divider {
    height: 0;
    margin: 0.5rem 0;
    overflow: hidden;
    border-top: 1px solid $fallback--border;
    border-top: 1px solid var(--border, $fallback--border);
  }

  .dropdown-item {
    line-height: 21px;
    overflow: hidden;
    display: block;
    padding: 0.5em 0.75em;
    clear: both;
    font-weight: 400;
    text-align: inherit;
    white-space: nowrap;
    border: none;
    border-radius: 0;
    background-color: transparent;
    box-shadow: none;
    width: 100%;
    height: 100%;
    box-sizing: border-box;

    --btnText: var(--popoverText, $fallback--text);

    &-icon {
      svg {
        width: 22px;
        margin-right: 0.75rem;
        color: var(--menuPopoverIcon, $fallback--icon);
      }
    }

    &.-has-submenu {
      .chevron-icon {
        margin-right: 0.25rem;
        margin-left: 2rem;
      }
    }

    &:active,
    &:hover {
      background-color: $fallback--lightBg;
      background-color: var(--selectedMenuPopover, $fallback--lightBg);
      box-shadow: none;

      --btnText: var(--selectedMenuPopoverText, $fallback--link);
      --faint: var(--selectedMenuPopoverFaintText, $fallback--faint);
      --faintLink: var(--selectedMenuPopoverFaintLink, $fallback--faint);
      --lightText: var(--selectedMenuPopoverLightText, $fallback--lightText);
      --icon: var(--selectedMenuPopoverIcon, $fallback--icon);

      svg {
        color: var(--selectedMenuPopoverIcon, $fallback--icon);

        --icon: var(--selectedMenuPopoverIcon, $fallback--icon);
      }
    }

    .menu-checkbox {
      display: inline-block;
      vertical-align: middle;
      min-width: 22px;
      max-width: 22px;
      min-height: 22px;
      max-height: 22px;
      line-height: 22px;
      text-align: center;
      border-radius: 0;
      background-color: $fallback--fg;
      background-color: var(--input, $fallback--fg);
      box-shadow: 0 0 2px black inset;
      box-shadow: var(--inputShadow);
      margin-right: 0.75em;

      &.menu-checkbox-checked::after {
        font-size: 1.25em;
        content: "✓";
      }

      &.-radio {
        border-radius: 9999px;

        &.menu-checkbox-checked::after {
          font-size: 2em;
          content: "•";
        }
      }
    }
  }

  .button-default.dropdown-item {
    &,
    i[class*="icon-"] {
      color: $fallback--text;
      color: var(--btnText, $fallback--text);
    }

    &:active {
      background-color: $fallback--lightBg;
      background-color: var(--selectedMenuPopover, $fallback--lightBg);
      color: $fallback--link;
      color: var(--selectedMenuPopoverText, $fallback--link);
    }

    &:disabled {
      color: $fallback--text;
      color: var(--btnDisabledText, $fallback--text);
    }

    &.toggled {
      color: $fallback--text;
      color: var(--btnToggledText, $fallback--text);
    }
  }
}
</style>
