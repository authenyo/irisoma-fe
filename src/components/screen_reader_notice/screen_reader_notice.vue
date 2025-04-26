<template>
  <div
    class="visible-for-screenreader-only"
    :aria-live="ariaLive"
  >
    {{ currentText }}
  </div>
</template>

<script src="./screen_reader_notice.js"></script>
