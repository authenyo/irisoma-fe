<template>
  <button
    class="media-upload"
    :class="[normalButton ? 'button-default btn' : 'button-unstyled', { disabled }]"
    :title="$t('tool_tip.media_upload')"
    @click="onClick"
  >
    <FAIcon
      v-if="uploading"
      class="progress-icon"
      icon="circle-notch"
      spin
    />
    <FAIcon
      v-if="!uploading"
      class="new-icon"
      icon="upload"
    />
    <template v-if="normalButton">
      {{ ' ' }}
      {{ uploading ? $t('general.loading') : $t('tool_tip.media_upload') }}
    </template>
    <input
      v-if="uploadReady"
      ref="input"
      class="hidden-input-file"
      :disabled="disabled"
      type="file"
      multiple="true"
      :accept="acceptTypes"
      @change="change"
    >
  </button>
</template>

<script src="./media_upload.js"></script>

<style lang="scss">
@import "../../variables";

.media-upload {
  .hidden-input-file {
    display: none;
  }
}

label.media-upload {
  cursor: pointer; // We use <label> for interactivity... i wonder if it's fine
}
</style>
