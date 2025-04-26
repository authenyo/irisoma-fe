<template>
  <div :class="['Timeline', classes.root]">
    <div :class="classes.header">
      <TimelineMenu
        v-if="!embedded"
        :timeline-name="timelineName"
      />
      <div
        v-if="showScrollTop && !embedded"
        class="rightside-button"
      >
        <button
          class="button-unstyled scroll-to-top-button"
          type="button"
          :title="$t('general.scroll_to_top')"
          @click="scrollToTop"
        >
          <FALayers class="fa-scale-110 fa-old-padding-layer">
            <FAIcon icon="arrow-up" />
            <FAIcon
              icon="minus"
              transform="up-7"
            />
          </FALayers>
        </button>
      </div>
      <template v-if="mobileLayout && !embedded">
        <div
          v-if="showLoadButton"
          class="rightside-button"
        >
          <button
            class="button-unstyled loadmore-button"
            :title="loadButtonString"
            @click.prevent="showNewStatuses"
          >
            <FAIcon
              fixed-width
              icon="circle-plus"
            />
            <div class="alert-badge">
              {{ mobileLoadButtonString }}
            </div>
          </button>
        </div>
        <div
          v-else-if="!embedded"
          class="loadmore-text faint veryfaint rightside-icon"
          :title="$t('timeline.up_to_date')"
          :aria-disabled="true"
          @click.prevent
        >
          <FAIcon
            fixed-width
            icon="check"
          />
        </div>
      </template>
      <template v-else>
        <button
          v-if="showLoadButton"
          class="button-default loadmore-button"
          @click.prevent="showNewStatuses"
        >
          {{ loadButtonString }}
        </button>
        <div
          v-else-if="!embedded"
          class="loadmore-text faint"
          @click.prevent
        >
          {{ $t('timeline.up_to_date') }}
        </div>
      </template>
      <QuickFilterSettings
        v-if="!embedded"
        class="rightside-button"
      />
      <QuickViewSettings
        v-if="!embedded"
        class="rightside-button"
      />
    </div>
    <div :class="classes.body">
      <div
        ref="timeline"
        class="timeline"
        role="feed"
      >
        <conversation
          v-for="statusId in filteredPinnedStatusIds"
          :key="statusId + '-pinned'"
          role="listitem"
          class="status-fadein"
          :status-id="statusId"
          :collapsable="true"
          :pinned-status-ids-object="pinnedStatusIdsObject"
          :in-profile="inProfile"
          :profile-user-id="userId"
        />
        <conversation
          v-for="status in filteredVisibleStatuses"
          :key="status.id"
          role="listitem"
          class="status-fadein"
          :status-id="status.id"
          :collapsable="true"
          :in-profile="inProfile"
          :profile-user-id="userId"
          :virtual-hidden="virtualScrollingEnabled && !statusesToDisplay.includes(status.id)"
        />
      </div>
    </div>
    <div :class="classes.footer">
      <teleport
        :to="footerSlipgate"
        :disabled="!embedded || !footerSlipgate"
      >
        <div
          v-if="count===0"
          class="new-status-notification text-center faint"
        >
          {{ $t('timeline.no_statuses') }}
        </div>
        <div
          v-else-if="bottomedOut"
          class="new-status-notification text-center faint"
        >
          {{ $t('timeline.no_more_statuses') }}
        </div>
        <button
          v-else-if="!timeline.loading"
          class="button-unstyled -link"
          @click.prevent="fetchOlderStatuses()"
        >
          <div class="new-status-notification text-center">
            {{ $t('timeline.load_older') }}
          </div>
        </button>
        <div
          v-else
          class="new-status-notification text-center"
        >
          <FAIcon
            icon="circle-notch"
            spin
            size="lg"
          />
        </div>
      </teleport>
    </div>
  </div>
</template>

<script src="./timeline.js"></script>

<style src="./timeline.scss" lang="scss"> </style>
