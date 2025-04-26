<template>
  <time
    :datetime="time"
    :title="localeDateString"
  >
    {{ relativeTimeString }}
  </time>
</template>

<script>
import * as DateUtils from 'src/services/date_utils/date_utils.js'
import localeService from 'src/services/locale/locale.service.js'

export default {
  name: 'Timeago',
  props: ['time', 'autoUpdate', 'longFormat', 'nowThreshold', 'templateKey'],
  data () {
    return {
      relativeTime: { key: 'time.now', num: 0 },
      interval: null
    }
  },
  computed: {
    localeDateString () {
      const browserLocale = localeService.internalToBrowserLocale(this.$i18n.locale)
      return typeof this.time === 'string'
        ? new Date(Date.parse(this.time)).toLocaleString(browserLocale)
        : this.time.toLocaleString(browserLocale)
    },
    relativeTimeString () {
      const timeString = this.$i18n.tc(this.relativeTime.key, this.relativeTime.num, [this.relativeTime.num])

      if (typeof this.templateKey === 'string' && this.relativeTime.key !== 'time.now') {
        return this.$i18n.t(this.templateKey, [timeString])
      }

      return timeString
    }
  },
  watch: {
    time (newVal, oldVal) {
      if (oldVal !== newVal) {
        clearTimeout(this.interval)
        this.refreshRelativeTimeObject()
      }
    }
  },
  created () {
    this.refreshRelativeTimeObject()
  },
  unmounted () {
    clearTimeout(this.interval)
  },
  methods: {
    refreshRelativeTimeObject () {
      const nowThreshold = typeof this.nowThreshold === 'number' ? this.nowThreshold : 1
      this.relativeTime = this.longFormat
        ? DateUtils.relativeTime(this.time, nowThreshold)
        : DateUtils.relativeTimeShort(this.time, nowThreshold)

      if (this.autoUpdate) {
        this.interval = setTimeout(
          this.refreshRelativeTimeObject,
          1000 * this.autoUpdate
        )
      }
    }
  }
}
</script>
