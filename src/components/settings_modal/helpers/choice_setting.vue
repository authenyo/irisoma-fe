<template>
  <label
    v-if="matchesExpertLevel"
    class="ChoiceSetting"
  >
    <template v-if="backendDescriptionLabel">
      {{ backendDescriptionLabel }}
    </template>
    <template v-else>
      <slot />
    </template>
    {{ ' ' }}
    <Select
      :model-value="realDraftMode ? draft :state"
      :disabled="disabled"
      @update:modelValue="update"
    >
      <option
        v-for="option in realOptions"
        :key="option.key"
        :value="option.value"
      >
        {{ option.label }}
        {{ option.value === defaultState ? $t('settings.instance_default_simple') : '' }}
      </option>
    </Select>
    <ModifiedIndicator
      :changed="isChanged"
      :onclick="reset"
    />
    <ProfileSettingIndicator :is-profile="isProfileSetting" />
    <DraftButtons />
    <p
      v-if="backendDescriptionDescription"
      class="setting-description"
    >
      {{ backendDescriptionDescription + ' ' }}
    </p>
  </label>
</template>

<script src="./choice_setting.js"></script>
