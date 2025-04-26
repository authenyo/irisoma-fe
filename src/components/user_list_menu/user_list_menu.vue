<template>
  <div class="UserListMenu">
    <Popover
      trigger="hover"
      placement="left"
      remove-padding
    >
      <template #content>
        <div class="dropdown-menu">
          <button
            v-for="list in lists"
            :key="list.id"
            class="button-default dropdown-item"
            @click="toggleList(list.id)"
          >
            <span
              class="menu-checkbox"
              :class="{ 'menu-checkbox-checked': list.inList }"
            />
            {{ list.title }}
          </button>
        </div>
      </template>
      <template #trigger>
        <button class="btn button-default dropdown-item -has-submenu">
          {{ $t('lists.manage_lists') }}
          <FAIcon
            class="chevron-icon"
            size="lg"
            icon="chevron-right"
          />
        </button>
      </template>
    </Popover>
  </div>
</template>

<script src="./user_list_menu.js"></script>
