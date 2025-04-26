<template>
  <div class="ListsUserSearch">
    <div class="input-wrap">
      <div class="input-search">
        <FAIcon
          class="search-icon fa-scale-110 fa-old-padding"
          icon="search"
        />
      </div>
      <input
        ref="search"
        v-model="query"
        :placeholder="$t('lists.search')"
        @input="onInput"
      >
    </div>
    <div class="input-wrap">
      <Checkbox
        v-model="followingOnly"
        @change="onInput"
      >
        {{ $t('lists.following_only') }}
      </Checkbox>
    </div>
  </div>
</template>

<script src="./lists_user_search.js"></script>
<style lang="scss">
@import "../../variables";

.ListsUserSearch {
  .input-wrap {
    display: flex;
    margin: 0.7em 0.5em;

    input {
      width: 100%;
    }
  }

  .search-icon {
    margin-right: 0.3em;
  }
}

</style>
