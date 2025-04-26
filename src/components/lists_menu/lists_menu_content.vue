<template>
  <ul>
    <NavigationEntry
      v-for="item in lists"
      :key="item.name"
      :show-pin="showPin"
      :item="item"
    />
  </ul>
</template>

<script src="./lists_menu_content.js"></script>
