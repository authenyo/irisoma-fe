<template>
  <div class="interface-language-switcher">
    <label>
      {{ promptText }}
    </label>
    <ul class="setting-list">
      <li
        v-for="index of controlledLanguage.keys()"
        :key="index"
      >
        <label>
          {{ index === 0 ? $t('settings.primary_language') : $tc('settings.fallback_language', index, { index }) }}
          <Select
            class="language-select"
            :model-value="controlledLanguage[index]"
            @update:modelValue="val => setLanguageAt(index, val)"
          >
            <option
              v-for="lang in languages"
              :key="lang.code"
              :value="lang.code"
            >
              {{ lang.name }}
            </option>
          </Select>
        </label>
        <button
          v-if="controlledLanguage.length > 1 && index !== 0"
          class="button-default btn"
          @click="() => removeLanguageAt(index)"
        >
          {{ $t('settings.remove_language') }}
        </button>
      </li>
      <li>
        <button
          class="button-default btn"
          @click="addLanguage"
        >
          {{ $t('settings.add_language') }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import localeService from '../../services/locale/locale.service.js'
import Select from '../select/select.vue'

export default {
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Select
  },
  props: {
    promptText: {
      type: String,
      required: true
    },
    language: {
      type: [Array, String],
      required: true
    },
    setLanguage: {
      type: Function,
      required: true
    }
  },
  computed: {
    languages () {
      return localeService.languages
    },

    controlledLanguage: {
      get: function () {
        return Array.isArray(this.language) ? this.language : [this.language]
      },
      set: function (val) {
        this.setLanguage(val)
      }
    }
  },

  methods: {
    getLanguageName (code) {
      return localeService.getLanguageName(code)
    },
    addLanguage () {
      this.controlledLanguage = [...this.controlledLanguage, '']
    },
    setLanguageAt (index, val) {
      const lang = [...this.controlledLanguage]
      lang[index] = val
      this.controlledLanguage = lang
    },
    removeLanguageAt (index) {
      const lang = [...this.controlledLanguage]
      lang.splice(index, 1)
      this.controlledLanguage = lang
    }
  }
}
</script>

<style lang="scss">
@import "../../variables";

.interface-language-switcher {
  .language-select {
    margin-right: 1em;
  }
}
</style>
