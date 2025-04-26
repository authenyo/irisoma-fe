<template>
  <div
    class="user-card"
    :class="classes"
  >
    <div
      :class="{ 'hide-bio': hideBio }"
      :style="style"
      class="background-image"
    />
    <div :class="onClose ? '' : panel-heading -flexible-height">
      <div class="user-info">
        <div class="container">
          <a
            v-if="avatarAction === 'zoom'"
            class="user-info-avatar -link"
            @click="zoomAvatar"
          >
            <UserAvatar
              :better-shadow="betterShadow"
              :user="user"
            />
            <div class="user-info-avatar -link -overlay">
              <FAIcon
                class="fa-scale-110 fa-old-padding"
                icon="search-plus"
              />
            </div>
          </a>
          <UserAvatar
            v-else-if="typeof avatarAction === 'function'"
            class="user-info-avatar"
            :better-shadow="betterShadow"
            :user="user"
            @click="avatarAction"
          />
          <router-link
            v-else
            :to="userProfileLink(user)"
          >
            <UserAvatar
              :better-shadow="betterShadow"
              :user="user"
            />
          </router-link>
          <div class="user-summary">
            <div class="top-line">
              <router-link
                :to="userProfileLink(user)"
                class="user-name"
              >
                <RichContent
                  :title="user.name"
                  :html="user.name"
                  :emoji="user.emoji"
                />
              </router-link>
              <button
                v-if="!isOtherUser && user.is_local"
                class="button-unstyled edit-profile-button"
                @click.stop="openProfileTab"
              >
                <FAIcon
                  fixed-width
                  class="icon"
                  icon="edit"
                  :title="$t('user_card.edit_profile')"
                />
              </button>
              <a
                v-if="isOtherUser && !user.is_local"
                :href="user.statusnet_profile_url"
                target="_blank"
                class="button-unstyled external-link-button"
              >
                <FAIcon
                  class="icon"
                  icon="external-link-alt"
                />
              </a>
              <AccountActions
                v-if="isOtherUser && loggedIn"
                :user="user"
                :relationship="relationship"
              />
              <router-link
                v-if="onClose"
                :to="userProfileLink(user)"
                class="button-unstyled external-link-button"
                @click="onClose"
              >
                <FAIcon
                  class="icon"
                  icon="expand-alt"
                />
              </router-link>
              <button
                v-if="onClose"
                class="button-unstyled external-link-button"
                @click="onClose"
              >
                <FAIcon
                  class="icon"
                  icon="times"
                />
              </button>
            </div>
            <div class="bottom-line">
              <user-link
                class="user-screen-name"
                :user="user"
              />
              <template v-if="!hideBio">
                <span
                  v-if="user.deactivated"
                  class="alert user-role"
                >
                  {{ $t('user_card.deactivated') }}
                </span>
                <span
                  v-if="!!visibleRole"
                  class="alert user-role"
                >
                  {{ $t(`general.role.${visibleRole}`) }}
                </span>
                <span
                  v-if="user.bot"
                  class="alert user-role"
                >
                  {{ $t('user_card.bot') }}
                </span>
              </template>
              <span v-if="user.locked">
                <FAIcon
                  class="lock-icon"
                  icon="lock"
                  size="sm"
                />
              </span>
              <span
                v-if="!mergedConfig.hideUserStats && !hideBio"
                class="dailyAvg"
              >{{ dailyAvg }} {{ $t('user_card.per_day') }}</span>
            </div>
          </div>
        </div>
        <div class="user-meta">
          <div
            v-if="relationship.followed_by && loggedIn && isOtherUser"
            class="following"
          >
            {{ $t('user_card.follows_you') }}
          </div>
          <div
            v-if="isOtherUser && (loggedIn || !switcher)"
            class="highlighter"
          >
            <!-- id's need to be unique, otherwise vue confuses which user-card checkbox belongs to -->
            <input
              v-if="userHighlightType !== 'disabled'"
              :id="'userHighlightColorTx'+user.id"
              v-model="userHighlightColor"
              class="userHighlightText"
              type="text"
            >
            <input
              v-if="userHighlightType !== 'disabled'"
              :id="'userHighlightColor'+user.id"
              v-model="userHighlightColor"
              class="userHighlightCl"
              type="color"
            >
            {{ ' ' }}
            <Select
              :id="'userHighlightSel'+user.id"
              v-model="userHighlightType"
              class="userHighlightSel"
            >
              <option value="disabled">
                {{ $t('user_card.highlight.disabled') }}
              </option>
              <option value="solid">
                {{ $t('user_card.highlight.solid') }}
              </option>
              <option value="striped">
                {{ $t('user_card.highlight.striped') }}
              </option>
              <option value="side">
                {{ $t('user_card.highlight.side') }}
              </option>
            </Select>
          </div>
        </div>
        <div
          v-if="loggedIn && isOtherUser"
          class="user-interactions"
        >
          <div class="btn-group">
            <FollowButton
              :relationship="relationship"
              :user="user"
            />
            <template v-if="relationship.following">
              <ProgressButton
                v-if="!relationship.subscribing"
                class="btn button-default"
                :click="subscribeUser"
                :title="$t('user_card.subscribe')"
              >
                <FAIcon icon="bell" />
              </ProgressButton>
              <ProgressButton
                v-else
                class="btn button-default toggled"
                :click="unsubscribeUser"
                :title="$t('user_card.unsubscribe')"
              >
                <FALayers>
                  <FAIcon
                    icon="rss"
                    transform="left-5 shrink-6 up-3 rotate-20"
                    flip="horizontal"
                  />
                  <FAIcon
                    icon="rss"
                    transform="right-5 shrink-6 up-3 rotate-20"
                  />
                  <FAIcon icon="bell" />
                </FALayers>
              </ProgressButton>
            </template>
          </div>
          <div>
            <button
              v-if="relationship.muting"
              class="btn button-default btn-block toggled"
              :disabled="user.deactivated"
              @click="unmuteUser"
            >
              {{ $t('user_card.muted') }}
            </button>
            <button
              v-else
              class="btn button-default btn-block"
              :disabled="user.deactivated"
              @click="muteUser"
            >
              {{ $t('user_card.mute') }}
            </button>
          </div>
          <div>
            <button
              class="btn button-default btn-block"
              :disabled="user.deactivated"
              @click="mentionUser"
            >
              {{ $t('user_card.mention') }}
            </button>
          </div>
          <ModerationTools
            v-if="showModerationMenu"
            :user="user"
          />
        </div>
        <div
          v-if="!loggedIn && user.is_local"
          class="user-interactions"
        >
          <RemoteFollow :user="user" />
        </div>
        <UserNote
          v-if="loggedIn && isOtherUser && (hasNote || (hasNoteEditor && supportsNote))"
          :user="user"
          :relationship="relationship"
          :editable="hasNoteEditor"
        />
      </div>
    </div>
    <div
      v-if="!hideBio"
      class="panel-body"
    >
      <div
        v-if="!mergedConfig.hideUserStats && switcher"
        class="user-counts"
      >
        <div
          class="user-count"
          @click.prevent="setProfileView('statuses')"
        >
          <h5>{{ $t('user_card.statuses') }}</h5>
          <span>{{ user.statuses_count }} <br></span>
        </div>
        <div
          class="user-count"
          @click.prevent="setProfileView('friends')"
        >
          <h5>{{ $t('user_card.followees') }}</h5>
          <span>{{ hideFollowsCount ? $t('user_card.hidden') : user.friends_count }}</span>
        </div>
        <div
          class="user-count"
          @click.prevent="setProfileView('followers')"
        >
          <h5>{{ $t('user_card.followers') }}</h5>
          <span>{{ hideFollowersCount ? $t('user_card.hidden') : user.followers_count }}</span>
        </div>
      </div>
      <RichContent
        v-if="!hideBio"
        class="user-card-bio"
        :html="user.description_html"
        :emoji="user.emoji"
        :handle-links="true"
      />
    </div>
    <teleport to="#modal">
      <confirm-modal
        v-if="showingConfirmMute"
        :title="$t('user_card.mute_confirm_title')"
        :confirm-text="$t('user_card.mute_confirm_accept_button')"
        :cancel-text="$t('user_card.mute_confirm_cancel_button')"
        @accepted="doMuteUser"
        @cancelled="hideConfirmMute"
      >
        <i18n-t
          keypath="user_card.mute_confirm"
          tag="div"
        >
          <template #user>
            <span
              v-text="user.screen_name_ui"
            />
          </template>
        </i18n-t>
        <div
          class="mute-expiry"
        >
          <label>
            {{ $t('user_card.mute_duration_prompt') }}
          </label>
          <input
            v-model="muteExpiryAmount"
            type="number"
            class="expiry-amount hide-number-spinner"
            :min="0"
          >
          <Select
            v-model="muteExpiryUnit"
            unstyled="true"
            class="expiry-unit"
          >
            <option
              v-for="unit in muteExpiryUnits"
              :key="unit"
              :value="unit"
            >
              {{ $t(`time.${unit}_short`, ['']) }}
            </option>
          </Select>
        </div>
      </confirm-modal>
    </teleport>
  </div>
</template>

<script src="./user_card.js"></script>

<style lang="scss" src="./user_card.scss" />
