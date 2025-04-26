<template>
  <NumberSetting
    v-bind="$attrs"
    truncate="1"
  >
    <slot />
  </NumberSetting>
</template>

<script>
import NumberSetting from './number_setting.vue'
export default {
  components: {
    NumberSetting
  }
}
</script>
