<template>
  <span
    v-if="matchesExpertLevel"
    class="SizeSetting"
  >
    <label
      :for="path"
      class="size-label"
    >
      <slot />
    </label>
    <input
      :id="path"
      class="number-input"
      type="number"
      step="1"
      :disabled="disabled"
      :min="min || 0"
      :value="stateValue"
      @change="updateValue"
    >
    <Select
      :id="path"
      :model-value="stateUnit"
      :disabled="disabled"
      class="css-unit-input"
      @change="updateUnit"
    >
      <option
        v-for="option in units"
        :key="option"
        :value="option"
      >
        {{ option }}
      </option>
    </Select>
    {{ ' ' }}
    <ModifiedIndicator
      :changed="isChanged"
      :onclick="reset"
    />
  </span>
</template>

<script src="./size_setting.js"></script>

<style lang="scss">
.SizeSetting {
  .number-input {
    max-width: 6.5em;
  }

  .css-unit-input,
  .css-unit-input select {
    margin-left: 0.5em;
    width: 4em;
    max-width: 4em;
    min-width: 4em;
  }
}

</style>
