<template>
  <div
    class="font-control style-control"
    :class="{ custom: isCustom }"
  >
    <label
      :id="name + '-label'"
      :for="preset === 'custom' ? name : name + '-font-switcher'"
      class="label"
    >
      {{ label }}
    </label>
    <input
      v-if="typeof fallback !== 'undefined'"
      :id="name + '-o'"
      :aria-labelledby="name + '-label'"
      class="opt exlcude-disabled visible-for-screenreader-only"
      type="checkbox"
      :checked="present"
      @change="$emit('update:modelValue', typeof modelValue === 'undefined' ? fallback : undefined)"
    >
    <label
      v-if="typeof fallback !== 'undefined'"
      class="opt-l"
      :for="name + '-o'"
      :aria-hidden="true"
    />
    {{ ' ' }}
    <Select
      :id="name + '-font-switcher'"
      v-model="preset"
      :disabled="!present"
      class="font-switcher"
    >
      <option
        v-for="option in availableOptions"
        :key="option"
        :value="option"
      >
        {{ option === 'custom' ? $t('settings.style.fonts.custom') : option }}
      </option>
    </Select>
    <input
      v-if="isCustom"
      :id="name"
      v-model="family"
      class="custom-font"
      type="text"
    >
  </div>
</template>

<script src="./font_control.js"></script>

<style lang="scss">
@import "../../variables";

.font-control {
  input.custom-font {
    min-width: 10em;
  }

  &.custom {
    /* TODO Should make proper joiners... */
    .font-switcher {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    .custom-font {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
}
</style>
