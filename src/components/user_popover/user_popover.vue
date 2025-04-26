<template>
  <Popover
    trigger="click"
    popover-class="popover-default user-popover"
    :overlay-centers-selector="overlayCentersSelector || '.user-info .Avatar'"
    :overlay-centers="overlayCenters && userPopoverOverlay"
    :disabled="disabled"
  >
    <template #trigger>
      <slot />
    </template>
    <template #content="{close}">
      <UserCard
        class="user-popover"
        :user-id="userId"
        :hide-bio="true"
        :avatar-action="userPopoverAvatarAction == 'close' ? close : userPopoverAvatarAction"
        :on-close="close"
      />
    </template>
  </Popover>
</template>

<script src="./user_popover.js"></script>

<style lang="scss">
@import "../../variables";

/* popover styles load on-demand, so we need to override */
/* stylelint-disable block-no-empty */
.user-popover.popover {
}
/* stylelint-enable block-no-empty */

</style>
