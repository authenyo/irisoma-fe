<template>
  <FAIcon
    v-if="user && user.screen_name_ui_contains_non_ascii"
    icon="code"
    :title="$t('unicode_domain_indicator.tooltip')"
  />
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faCode
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faCode
)

const UnicodeDomainIndicator = {
  props: {
    user: Object
  }
}

export default UnicodeDomainIndicator
</script>
