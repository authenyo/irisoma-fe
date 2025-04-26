<template>
  <div :label="$t('admin_dash.tabs.limits')">
    <div class="setting-item">
      <h2>{{ $t('admin_dash.limits.arbitrary_limits') }}</h2>
      <ul class="setting-list">
        <li>
          <h3>{{ $t('admin_dash.limits.posts') }}</h3>
          <ul class="setting-list">
            <li>
              <IntegerSetting
                source="admin"
                path=":pleroma.:instance.:limit"
                draft-mode
              />
            </li>
            <li>
              <IntegerSetting
                source="admin"
                path=":pleroma.:instance.:remote_limit"
                expert="1"
                draft-mode
              />
            </li>
          </ul>
        </li>
        <li>
          <h3>{{ $t('admin_dash.limits.uploads') }}</h3>
          <ul class="setting-list">
            <li>
              <IntegerSetting
                source="admin"
                path=":pleroma.:instance.:description_limit"
                draft-mode
              />
            </li>
            <li>
              <IntegerSetting
                source="admin"
                path=":pleroma.:instance.:upload_limit"
                draft-mode
              />
            </li>
            <li>
              <IntegerSetting
                source="admin"
                path=":pleroma.:instance.:max_media_attachments"
                draft-mode
              />
            </li>
          </ul>
        </li>
        <li>
          <h3>{{ $t('admin_dash.limits.users') }}</h3>
          <ul class="setting-list">
            <li>
              <IntegerSetting
                source="admin"
                path=":pleroma.:instance.:max_pinned_statuses"
                draft-mode
              />
            </li>
            <li>
              <IntegerSetting
                source="admin"
                path=":pleroma.:instance.:user_bio_length"
                draft-mode
              />
            </li>
            <li>
              <IntegerSetting
                source="admin"
                path=":pleroma.:instance.:user_name_length"
                draft-mode
              />
            </li>
            <li>
              <h4>{{ $t('admin_dash.limits.profile_fields') }}</h4>
              <ul class="setting-list">
                <li>
                  <IntegerSetting
                    source="admin"
                    path=":pleroma.:instance.:max_account_fields"
                    draft-mode
                  />
                </li>
                <li>
                  <IntegerSetting
                    source="admin"
                    path=":pleroma.:instance.:max_remote_account_fields"
                    draft-mode
                    expert="1"
                  />
                </li>
                <li>
                  <IntegerSetting
                    source="admin"
                    path=":pleroma.:instance.:account_field_name_length"
                    draft-mode
                  />
                </li>
                <li>
                  <IntegerSetting
                    source="admin"
                    path=":pleroma.:instance.:account_field_value_length"
                    draft-mode
                  />
                </li>
              </ul>
            </li>
            <li>
              <h4>{{ $t('admin_dash.limits.user_uploads') }}</h4>
              <ul class="setting-list">
                <li>
                  <IntegerSetting
                    source="admin"
                    path=":pleroma.:instance.:avatar_upload_limit"
                    draft-mode
                  />
                </li>
                <li>
                  <IntegerSetting
                    source="admin"
                    path=":pleroma.:instance.:banner_upload_limit"
                    draft-mode
                  />
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script src="./limits_tab.js"></script>
