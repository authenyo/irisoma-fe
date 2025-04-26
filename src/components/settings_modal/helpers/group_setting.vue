<template>
  <span
    v-if="matchesExpertLevel"
    class="GroupSetting"
  >
    <ModifiedIndicator
      :changed="isChanged"
      :onclick="reset"
    />
    <ProfileSettingIndicator :is-profile="isProfileSetting" />
    <DraftButtons />
  </span>
</template>

<script src="./group_setting.js"></script>
