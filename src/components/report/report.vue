<template>
  <div class="Report">
    <div class="reported-user">
      <span>{{ $t('report.reported_user') }}</span>
      <router-link :to="generateUserProfileLink(report.acct)">
        @{{ report.acct.screen_name }}
      </router-link>
    </div>
    <div class="reporter">
      <span>{{ $t('report.reporter') }}</span>
      <router-link :to="generateUserProfileLink(report.actor)">
        @{{ report.actor.screen_name }}
      </router-link>
    </div>
    <div class="report-state">
      <span>{{ $t('report.state') }}</span>
      <Select
        :id="report-state"
        v-model="state"
        class="form-control"
      >
        <option
          v-for="state in ['open', 'closed', 'resolved']"
          :key="state"
          :value="state"
        >
          {{ $t('report.state_' + state) }}
        </option>
      </Select>
    </div>
    <RichContent
      class="report-content"
      :html="report.content"
      :emoji="[]"
    />
    <div v-if="report.statuses.length">
      <small>{{ $t('report.reported_statuses') }}</small>
      <router-link
        v-for="status in report.statuses"
        :key="status.id"
        :to="{ name: 'conversation', params: { id: status.id } }"
        class="reported-status"
      >
        <div class="reported-status-heading">
          <span class="reported-status-name">{{ status.user.name }}</span>
          <Timeago
            :time="status.created_at"
            :auto-update="240"
            class="faint"
          />
        </div>
        <status-content :status="status" />
      </router-link>
    </div>
    <div v-if="report.notes.length">
      <small>{{ $t('report.notes') }}</small>
      <div
        v-for="note in report.notes"
        :key="note.id"
        class="note"
      >
        <span>{{ note.content }}</span>
        <Timeago
          :time="note.created_at"
          :auto-update="240"
          class="faint"
        />
      </div>
    </div>
  </div>
</template>

<script src="./report.js"></script>
<style src="./report.scss" lang="scss"></style>
