import BooleanSetting from '../helpers/boolean_setting.vue'
import ChoiceSetting from '../helpers/choice_setting.vue'
import IntegerSetting from '../helpers/integer_setting.vue'
import StringSetting from '../helpers/string_setting.vue'

import SharedComputedObject from '../helpers/shared_computed_object.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faGlobe
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faGlobe
)

const LimitsTab = {
  data () {},
  components: {
    BooleanSetting,
    ChoiceSetting,
    IntegerSetting,
    StringSetting
  },
  computed: {
    ...SharedComputedObject()
  }
}

export default LimitsTab
