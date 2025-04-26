<template>
  <div
    class="user-note"
  >
    <div class="heading">
      <span>{{ $t('user_card.note') }}</span>
      <div class="buttons">
        <button
          v-show="!editing && editable"
          class="button-default btn"
          @click="startEditing"
        >
          {{ $t('user_card.edit_note') }}
        </button>
        <button
          v-show="editing"
          class="button-default btn"
          :disabled="frozen"
          @click="finalizeEditing"
        >
          {{ $t('user_card.edit_note_apply') }}
        </button>
        <button
          v-show="editing"
          class="button-default btn"
          :disabled="frozen"
          @click="cancelEditing"
        >
          {{ $t('user_card.edit_note_cancel') }}
        </button>
      </div>
    </div>
    <textarea
      v-show="editing"
      v-model="localNote"
      class="note-text"
    />
    <span
      v-show="!editing"
      class="note-text"
      :class="{ '-blank': !relationship.note }"
    >
      {{ relationship.note || $t('user_card.note_blank') }}
    </span>
  </div>
</template>

<script src="./user_note.js"></script>

<style lang="scss">
@import "../../variables";

.user-note {
  display: flex;
  flex-direction: column;

  .heading {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75em;

    .btn {
      min-width: 95px;
    }

    .buttons {
      display: flex;
      flex-direction: row;
      justify-content: right;

      .btn {
        margin-left: 0.5em;
      }
    }
  }

  .note-text {
    align-self: stretch;
  }

  .note-text.-blank {
    font-style: italic;
    color: var(--faint, $fallback--faint);
  }
}
</style>
