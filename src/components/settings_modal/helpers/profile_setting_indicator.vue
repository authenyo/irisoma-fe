<template>
  <span
    v-if="isProfile"
    class="ProfileSettingIndicator"
  >
    <Popover
      trigger="hover"
    >
      <template #trigger>
        &nbsp;
        <FAIcon
          icon="server"
          :aria-label="$t('settings.setting_server_side')"
        />
      </template>
      <template #content>
        <div class="profilesetting-tooltip">
          {{ $t('settings.setting_server_side') }}
        </div>
      </template>
    </Popover>
  </span>
</template>

<script>
import Popover from 'src/components/popover/popover.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faServer } from '@fortawesome/free-solid-svg-icons'

library.add(
  faServer
)

export default {
  components: { Popover },
  props: ['isProfile']
}
</script>

<style lang="scss">
.ProfileSettingIndicator {
  display: inline-block;
  position: relative;
}

.profilesetting-tooltip {
  margin: 0.5em 1em;
  min-width: 10em;
  text-align: center;
}
</style>
