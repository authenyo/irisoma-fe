<template>
  <!-- eslint-disable vue/no-multiple-template-root -->
  <router-link
    v-if="to"
    v-slot="props"
    :to="to"
    custom
  >
    <slot
      v-bind="props"
    />
  </router-link>
  <slot
    v-else
    v-bind="{}"
  />
</template>

<script>
export default {
  props: ['to']
}
</script>
