<template>
  <dialog-modal
    v-body-scroll-lock="true"
    class="confirm-modal"
    :on-cancel="onCancel"
  >
    <template #header>
      <span v-text="title" />
    </template>

    <slot />

    <template #footer>
      <button
        class="btn button-default"
        @click.prevent="onAccept"
        v-text="confirmText"
      />

      <button
        class="btn button-default"
        @click.prevent="onCancel"
        v-text="cancelText"
      />
    </template>
  </dialog-modal>
</template>

<script src="./confirm_modal.js"></script>
