<template>
  <div class="Lists panel panel-default">
    <div class="panel-heading">
      <div class="title">
        {{ $t('lists.lists') }}
      </div>
      <router-link
        :to="{ name: 'lists-new' }"
        class="button-default btn new-list-button"
      >
        {{ $t("lists.new") }}
      </router-link>
    </div>
    <div class="panel-body">
      <ListsCard
        v-for="list in lists.slice().reverse()"
        :key="list"
        :list="list"
        class="list-item"
      />
    </div>
  </div>
</template>

<script src="./lists.js"></script>

<style lang="scss">
.Lists {
  .new-list-button {
    padding: 0 0.5em;
  }
}
</style>
