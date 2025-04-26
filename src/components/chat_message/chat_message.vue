<template>
  <div
    v-if="isMessage"
    class="chat-message-wrapper"
    :class="{ 'hovered-message-chain': hoveredMessageChain }"
    @mouseover="onHover(true)"
    @mouseleave="onHover(false)"
  >
    <div
      class="chat-message"
      :class="[{ 'outgoing': isCurrentUser, 'incoming': !isCurrentUser }]"
    >
      <div
        v-if="!isCurrentUser"
        class="avatar-wrapper"
      >
        <UserPopover
          v-if="chatViewItem.isHead"
          :user-id="author.id"
        >
          <UserAvatar
            :compact="true"
            :better-shadow="betterShadow"
            :user="author"
          />
        </UserPopover>
      </div>
      <div class="chat-message-inner">
        <div
          class="status-body"
          :style="{ 'min-width': message.attachment ? '80%' : '' }"
        >
          <div
            class="media status"
            :class="{ 'without-attachment': !hasAttachment, 'pending': chatViewItem.data.pending, 'error': chatViewItem.data.error }"
            style="position: relative;"
            @mouseenter="hovered = true"
            @mouseleave="hovered = false"
          >
            <div
              class="chat-message-menu"
              :class="{ 'visible': hovered || menuOpened }"
            >
              <Popover
                trigger="click"
                placement="top"
                bound-to-selector=".chat-view-inner"
                :bound-to="{ x: 'container' }"
                :margin="popoverMarginStyle"
                @show="menuOpened = true"
                @close="menuOpened = false"
              >
                <template #content>
                  <div class="dropdown-menu">
                    <button
                      class="button-default dropdown-item dropdown-item-icon"
                      @click="deleteMessage"
                    >
                      <FAIcon icon="times" /> {{ $t("chats.delete") }}
                    </button>
                  </div>
                </template>
                <template #trigger>
                  <button
                    class="button-default menu-icon"
                    :title="$t('chats.more')"
                  >
                    <FAIcon icon="ellipsis-h" />
                  </button>
                </template>
              </Popover>
            </div>
            <StatusContent
              class="message-content"
              :status="messageForStatusContent"
              :full-content="true"
            >
              <template #footer>
                <span
                  class="created-at"
                >
                  {{ createdAt }}
                </span>
              </template>
            </StatusContent>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    class="chat-message-date-separator"
  >
    <ChatMessageDate :date="chatViewItem.date" />
  </div>
</template>

<script src="./chat_message.js"></script>
<style lang="scss">
@import "./chat_message";

</style>
