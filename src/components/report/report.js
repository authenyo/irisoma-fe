import Select from '../select/select.vue'
import StatusContent from '../status_content/status_content.vue'
import Timeago from '../timeago/timeago.vue'
import RichContent from 'src/components/rich_content/rich_content.jsx'
import generateProfileLink from 'src/services/user_profile_link_generator/user_profile_link_generator'

const Report = {
  props: [
    'reportId'
  ],
  components: {
    Select,
    StatusContent,
    Timeago,
    RichContent
  },
  computed: {
    report () {
      console.log(this.$store.state.reports.reports[this.reportId] || {})
      return this.$store.state.reports.reports[this.reportId] || {}
    },
    state: {
      get: function () { return this.report.state },
      set: function (val) { this.setReportState(val) }
    }
  },
  methods: {
    generateUserProfileLink (user) {
      return generateProfileLink(user.id, user.screen_name, this.$store.state.instance.restrictedNicknames)
    },
    setReportState (state) {
      return this.$store.dispatch('setReportState', { id: this.report.id, state })
    }
  }
}

export default Report
