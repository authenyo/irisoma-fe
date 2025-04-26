<template>
  <div :label="$t('admin_dash.tabs.instance')">
    <div class="setting-item">
      <h2>{{ $t('admin_dash.instance.instance') }}</h2>
      <ul class="setting-list">
        <li>
          <StringSetting path=":pleroma.:instance.:name" />
        </li>
        <!-- See https://git.pleroma.social/pleroma/pleroma/-/merge_requests/3963 -->
        <li v-if="adminDraft[':pleroma'][':instance'][':favicon'] !== undefined">
          <AttachmentSetting compact path=":pleroma.:instance.:favicon" />
        </li>
        <li>
          <StringSetting path=":pleroma.:instance.:email" />
        </li>
        <li>
          <StringSetting path=":pleroma.:instance.:description" />
        </li>
        <li>
          <StringSetting path=":pleroma.:instance.:short_description" />
        </li>
        <li>
          <AttachmentSetting compact path=":pleroma.:instance.:instance_thumbnail" />
        </li>
        <li>
          <AttachmentSetting path=":pleroma.:instance.:background_image" />
        </li>
      </ul>
    </div>
    <div class="setting-item">
      <h2>{{ $t('admin_dash.instance.registrations') }}</h2>
      <ul class="setting-list">
        <li>
          <BooleanSetting path=":pleroma.:instance.:registrations_open" />
          <ul class="setting-list suboptions">
            <li>
              <BooleanSetting
                path=":pleroma.:instance.:invites_enabled"
                parent-path=":pleroma.:instance.:registrations_open"
                parent-invert
              />
            </li>
          </ul>
        </li>
        <li>
          <BooleanSetting path=":pleroma.:instance.:birthday_required" />
          <ul class="setting-list suboptions">
            <li>
              <IntegerSetting
                path=":pleroma.:instance.:birthday_min_age"
                parent-path=":pleroma.:instance.:birthday_required"
              />
            </li>
          </ul>
        </li>
        <li>
          <BooleanSetting path=":pleroma.:instance.:account_activation_required" />
        </li>
        <li>
          <BooleanSetting path=":pleroma.:instance.:account_approval_required" />
        </li>
        <li>
          <h3>{{ $t('admin_dash.instance.captcha_header') }}</h3>
          <ul class="setting-list">
            <li>
              <BooleanSetting :path="[':pleroma', 'Pleroma.Captcha', ':enabled']" />
              <ul class="setting-list suboptions">
                <li>
                  <ChoiceSetting
                    :path="[':pleroma', 'Pleroma.Captcha', ':method']"
                    :parent-path="[':pleroma', 'Pleroma.Captcha', ':enabled']"
                    :option-label-map="{
                      'Pleroma.Captcha.Native': $t('admin_dash.captcha.native'),
                      'Pleroma.Captcha.Kocaptcha': $t('admin_dash.captcha.kocaptcha')
                    }"
                  />
                  <IntegerSetting
                    :path="[':pleroma', 'Pleroma.Captcha', ':seconds_valid']"
                    :parent-path="[':pleroma', 'Pleroma.Captcha', ':enabled']"
                  />
                </li>
                <li
                  v-if="adminDraft[':pleroma']['Pleroma.Captcha'][':enabled'] && adminDraft[':pleroma']['Pleroma.Captcha'][':method'] === 'Pleroma.Captcha.Kocaptcha'"
                >
                  <h4>{{ $t('admin_dash.instance.kocaptcha') }}</h4>
                  <ul class="setting-list">
                    <li>
                      <StringSetting :path="[':pleroma', 'Pleroma.Captcha.Kocaptcha', ':endpoint']" />
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="setting-item">
      <h2>{{ $t('admin_dash.instance.access') }}</h2>
      <ul class="setting-list">
        <li>
          <BooleanSetting
            override-backend-description
            override-backend-description-label
            path=":pleroma.:instance.:public"
          />
        </li>
        <li>
          <ChoiceSetting
            override-backend-description
            override-backend-description-label
            path=":pleroma.:instance.:limit_to_local_content"
          />
        </li>
        <li v-if="expertLevel">
          <h3>{{ $t('admin_dash.instance.restrict.header') }}</h3>
          <p>
            {{ $t('admin_dash.instance.restrict.description') }}
          </p>
          <ul class="setting-list">
            <li>
              <h4>{{ $t('admin_dash.instance.restrict.timelines') }}</h4>
              <ul class="setting-list">
                <li>
                  <BooleanSetting
                    path=":pleroma.:restrict_unauthenticated.:timelines.:local"
                    indeterminate-state=":if_instance_is_private"
                    swap-description-and-label
                    hide-description
                  />
                </li>
                <li>
                  <BooleanSetting
                    path=":pleroma.:restrict_unauthenticated.:timelines.:federated"
                    indeterminate-state=":if_instance_is_private"
                    swap-description-and-label
                    hide-description
                  />
                </li>
                <li>
                  <GroupSetting path=":pleroma.:restrict_unauthenticated.:timelines" />
                </li>
              </ul>
            </li>
            <li>
              <h4>{{ $t('admin_dash.instance.restrict.profiles') }}</h4>
              <ul class="setting-list">
                <li>
                  <BooleanSetting
                    path=":pleroma.:restrict_unauthenticated.:profiles.:local"
                    indeterminate-state=":if_instance_is_private"
                    swap-description-and-label
                    hide-description
                  />
                </li>
                <li>
                  <BooleanSetting
                    path=":pleroma.:restrict_unauthenticated.:profiles.:remote"
                    indeterminate-state=":if_instance_is_private"
                    swap-description-and-label
                    hide-description
                  />
                </li>
                <li>
                  <GroupSetting path=":pleroma.:restrict_unauthenticated.:profiles" />
                </li>
              </ul>
            </li>
            <li>
              <h4>{{ $t('admin_dash.instance.restrict.activities') }}</h4>
              <ul class="setting-list">
                <li>
                  <BooleanSetting
                    path=":pleroma.:restrict_unauthenticated.:activities.:local"
                    indeterminate-state=":if_instance_is_private"
                    swap-description-and-label
                    hide-description
                  />
                </li>
                <li>
                  <BooleanSetting
                    path=":pleroma.:restrict_unauthenticated.:activities.:remote"
                    indeterminate-state=":if_instance_is_private"
                    swap-description-and-label
                    hide-description
                  />
                </li>
                <li>
                  <GroupSetting path=":pleroma.:restrict_unauthenticated.:activities" />
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script src="./instance_tab.js"></script>
