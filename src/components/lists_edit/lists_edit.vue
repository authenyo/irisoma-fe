<template>
  <div class="panel-default panel ListEdit">
    <div
      ref="header"
      class="panel-heading list-edit-heading"
    >
      <button
        class="button-unstyled go-back-button"
        @click="$router.back"
      >
        <FAIcon
          size="lg"
          icon="chevron-left"
        />
      </button>
      <div class="title">
        <i18n-t
          v-if="id"
          keypath="lists.editing_list"
        >
          <template #listTitle>
            {{ title }}
          </template>
        </i18n-t>
        <i18n-t
          v-else
          keypath="lists.creating_list"
        />
      </div>
    </div>
    <div class="panel-body">
      <div class="input-wrap">
        <label for="list-edit-title">{{ $t('lists.title') }}</label>
        {{ ' ' }}
        <input
          id="list-edit-title"
          ref="title"
          v-model="titleDraft"
        >
        <button
          v-if="id"
          class="btn button-default follow-button"
          @click="updateListTitle"
        >
          {{ $t('lists.update_title') }}
        </button>
      </div>
      <tab-switcher
        class="list-member-management"
        :scrollable-tabs="true"
      >
        <div
          v-if="id || addedUserIds.size > 0"
          :label="$t('lists.manage_members')"
          class="members-list"
        >
          <div class="users-list">
            <div
              v-for="user in membersUsers"
              :key="user.id"
              class="member"
            >
              <BasicUserCard
                :user="user"
              >
                <button
                  class="btn button-default follow-button"
                  @click="toggleRemoveMember(user)"
                >
                  {{ isRemoved(user) ? $t('general.undo') : $t('lists.remove_from_list') }}
                </button>
              </BasicUserCard>
            </div>
          </div>
        </div>

        <div
          class="search-list"
          :label="$t('lists.add_members')"
        >
          <ListsUserSearch
            @results="onSearchResults"
            @loading="onSearchLoading"
            @loadingDone="onSearchLoadingDone"
          />
          <div
            v-if="searchLoading"
            class="loading"
          >
            <PanelLoading />
          </div>
          <div
            v-else
            class="users-list"
          >
            <div
              v-for="user in searchUsers"
              :key="user.id"
              class="member"
            >
              <BasicUserCard
                :user="user"
              >
                <span
                  v-if="membersUserIds.includes(user.id)"
                >
                  {{ $t('lists.is_in_list') }}
                </span>
                <button
                  v-if="!membersUserIds.includes(user.id)"
                  class="btn button-default follow-button"
                  @click="toggleAddFromSearch(user)"
                >
                  {{ isAdded(user) ? $t('general.undo') : $t('lists.add_to_list') }}
                </button>
                <button
                  v-else
                  class="btn button-default follow-button"
                  @click="toggleRemoveMember(user)"
                >
                  {{ isRemoved(user) ? $t('general.undo') : $t('lists.remove_from_list') }}
                </button>
              </BasicUserCard>
            </div>
          </div>
        </div>
      </tab-switcher>
    </div>
    <div class="panel-footer">
      <span class="spacer" />
      <button
        v-if="!id"
        class="btn button-default footer-button"
        @click="createList"
      >
        {{ $t('lists.create') }}
      </button>
      <button
        v-else-if="!reallyDelete"
        class="btn button-default footer-button"
        @click="reallyDelete = true"
      >
        {{ $t('lists.delete') }}
      </button>
      <template v-else>
        {{ $t('lists.really_delete') }}
        <button
          class="btn button-default footer-button"
          @click="deleteList"
        >
          {{ $t('general.yes') }}
        </button>
        <button
          class="btn button-default footer-button"
          @click="reallyDelete = false"
        >
          {{ $t('general.no') }}
        </button>
      </template>
    </div>
  </div>
</template>

<script src="./lists_edit.js"></script>

<style lang="scss">
@import "../../variables";

.ListEdit {
  --panel-body-padding: 0.5em;

  height: calc(100vh - var(--navbar-height));
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .list-edit-heading {
    grid-template-columns: auto minmax(50%, 1fr);
  }

  .panel-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }

  .list-member-management {
    flex: 1 0 auto;
  }

  .search-icon {
    margin-right: 0.3em;
  }

  .users-list {
    padding-bottom: 0.7rem;
    overflow-y: auto;
  }

  & .search-list,
  & .members-list {
    overflow: hidden;
    flex-direction: column;
    min-height: 0;
  }

  .go-back-button {
    text-align: center;
    line-height: 1;
    height: 100%;
    align-self: start;
    width: var(--__panel-heading-height-inner);
  }

  .btn {
    margin: 0 0.5em;
  }

  .panel-footer {
    grid-template-columns: minmax(10%, 1fr);

    .footer-button {
      min-width: 9em;
    }
  }
}
</style>
