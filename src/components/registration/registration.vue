<template>
  <div class="settings panel panel-default">
    <div class="panel-heading">
      {{ $t('registration.registration') }}
    </div>
    <div class="panel-body">
      <form
        class="registration-form"
        @submit.prevent="submit(user)"
      >
        <div class="container">
          <div class="text-fields">
            <div
              class="form-group"
              :class="{ 'form-group--error': v$.user.username.$error }"
            >
              <label
                class="form--label"
                for="sign-up-username"
              >{{ $t('login.username') }}</label>
              <input
                id="sign-up-username"
                v-model.trim="v$.user.username.$model"
                :disabled="isPending"
                class="form-control"
                :aria-required="true"
                :placeholder="$t('registration.username_placeholder')"
              >
            </div>
            <div
              v-if="v$.user.username.$dirty"
              class="form-error"
            >
              <ul>
                <li v-if="!v$.user.username.required">
                  <span>{{ $t('registration.validations.username_required') }}</span>
                </li>
              </ul>
            </div>

            <div
              class="form-group"
              :class="{ 'form-group--error': v$.user.fullname.$error }"
            >
              <label
                class="form--label"
                for="sign-up-fullname"
              >{{ $t('registration.fullname') }}</label>
              <input
                id="sign-up-fullname"
                v-model.trim="v$.user.fullname.$model"
                :disabled="isPending"
                class="form-control"
                :aria-required="true"
                :placeholder="$t('registration.fullname_placeholder')"
              >
            </div>
            <div
              v-if="v$.user.fullname.$dirty"
              class="form-error"
            >
              <ul>
                <li v-if="!v$.user.fullname.required">
                  <span>{{ $t('registration.validations.fullname_required') }}</span>
                </li>
              </ul>
            </div>

            <div
              class="form-group"
              :class="{ 'form-group--error': v$.user.email.$error }"
            >
              <label
                class="form--label"
                for="email"
              >{{ accountActivationRequired ? $t('registration.email') : $t('registration.email_optional') }}</label>
              <input
                id="email"
                v-model="v$.user.email.$model"
                :disabled="isPending"
                class="form-control"
                type="email"
                :aria-required="accountActivationRequired"
              >
            </div>
            <div
              v-if="v$.user.email.$dirty"
              class="form-error"
            >
              <ul>
                <li v-if="!v$.user.email.required">
                  <span>{{ $t('registration.validations.email_required') }}</span>
                </li>
              </ul>
            </div>

            <div class="form-group">
              <label
                class="form--label"
                for="bio"
              >{{ $t('registration.bio_optional') }}</label>
              <textarea
                id="bio"
                v-model="user.bio"
                :disabled="isPending"
                class="form-control"
                :placeholder="bioPlaceholder"
              />
            </div>

            <div
              class="form-group"
              :class="{ 'form-group--error': v$.user.password.$error }"
            >
              <label
                class="form--label"
                for="sign-up-password"
              >{{ $t('login.password') }}</label>
              <input
                id="sign-up-password"
                v-model="user.password"
                :disabled="isPending"
                class="form-control"
                type="password"
                :aria-required="true"
              >
            </div>
            <div
              v-if="v$.user.password.$dirty"
              class="form-error"
            >
              <ul>
                <li v-if="!v$.user.password.required">
                  <span>{{ $t('registration.validations.password_required') }}</span>
                </li>
              </ul>
            </div>

            <div
              class="form-group"
              :class="{ 'form-group--error': v$.user.confirm.$error }"
            >
              <label
                class="form--label"
                for="sign-up-password-confirmation"
              >{{ $t('registration.password_confirm') }}</label>
              <input
                id="sign-up-password-confirmation"
                v-model="user.confirm"
                :disabled="isPending"
                class="form-control"
                type="password"
                :aria-required="true"
              >
            </div>
            <div
              v-if="v$.user.confirm.$dirty"
              class="form-error"
            >
              <ul>
                <li v-if="v$.user.confirm.required.$invalid">
                  <span>{{ $t('registration.validations.password_confirmation_required') }}</span>
                </li>
                <li v-if="v$.user.confirm.sameAs.$invalid">
                  <span>{{ $t('registration.validations.password_confirmation_match') }}</span>
                </li>
              </ul>
            </div>

            <div
              class="form-group"
              :class="{ 'form-group--error': v$.user.birthday.$error }"
            >
              <label
                class="form--label"
                for="sign-up-birthday"
              >
                {{ birthdayRequired ? $t('registration.birthday') : $t('registration.birthday_optional') }}
              </label>
              <input
                id="sign-up-birthday"
                v-model="user.birthday"
                :disabled="isPending"
                class="form-control"
                type="date"
                :max="birthdayRequired ? birthdayMinAttr : undefined"
                :aria-required="birthdayRequired"
              >
            </div>
            <div
              v-if="v$.user.birthday.$dirty"
              class="form-error"
            >
              <ul>
                <li v-if="v$.user.birthday.required.$invalid">
                  <span>{{ $t('registration.validations.birthday_required') }}</span>
                </li>
                <li v-if="v$.user.birthday.maxValue.$invalid">
                  <span>{{ $tc('registration.validations.birthday_min_age', { date: birthdayMinFormatted }) }}</span>
                </li>
              </ul>
            </div>

            <div
              class="form-group"
              :class="{ 'form-group--error': v$.user.language.$error }"
            >
              <interface-language-switcher
                for="email-language"
                :prompt-text="$t('registration.email_language')"
                :language="v$.user.language.$model"
                :set-language="val => v$.user.language.$model = val"
                @click.stop.prevent
              />
            </div>

            <div
              v-if="accountApprovalRequired"
              class="form-group"
            >
              <label
                class="form--label"
                for="reason"
              >{{ $t('registration.reason') }}</label>
              <textarea
                id="reason"
                v-model="user.reason"
                :disabled="isPending"
                class="form-control"
                :placeholder="reasonPlaceholder"
              />
            </div>

            <div
              v-if="captcha.type != 'none'"
              id="captcha-group"
              class="form-group"
            >
              <label
                class="form--label"
                for="captcha-label"
              >{{ $t('registration.captcha') }}</label>

              <template v-if="['kocaptcha', 'native'].includes(captcha.type)">
                <img
                  :src="captcha.url"
                  @click="setCaptcha"
                >

                <sub>{{ $t('registration.new_captcha') }}</sub>

                <input
                  id="captcha-answer"
                  v-model="captcha.solution"
                  :disabled="isPending"
                  class="form-control"
                  type="text"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                >
              </template>
            </div>

            <div
              v-if="token"
              class="form-group"
            >
              <label for="token">{{ $t('registration.token') }}</label>
              <input
                id="token"
                v-model="token"
                disabled="true"
                class="form-control"
                type="text"
              >
            </div>
            <div class="form-group">
              <button
                :disabled="isPending"
                type="submit"
                class="btn button-default"
              >
                {{ $t('registration.register') }}
              </button>
            </div>
          </div>

          <!-- eslint-disable vue/no-v-html -->
          <div
            class="terms-of-service"
            v-html="termsOfService"
          />
          <!-- eslint-enable vue/no-v-html -->
        </div>
        <div
          v-if="serverValidationErrors.length"
          class="form-group"
        >
          <div class="alert error">
            <span
              v-for="error in serverValidationErrors"
              :key="error"
            >{{ error }}</span>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script src="./registration.js"></script>
<style lang="scss">
@import "../../variables";
$validations-cRed: #f04124;

.registration-form {
  display: flex;
  flex-direction: column;
  margin: 0.6em;

  .container {
    display: flex;
    flex-direction: row;

    > * {
      min-width: 0;
    }
  }

  .terms-of-service {
    flex: 0 1 50%;
    margin: 0.8em;
  }

  .text-fields {
    margin-top: 0.6em;
    flex: 1 0;
    display: flex;
    flex-direction: column;
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    padding: 0.3em 0;
    line-height: 2;
    margin-bottom: 1em;
  }

  .form-group--error {
    animation-name: shakeError;
    animation-duration: 0.6s;
    animation-timing-function: ease-in-out;
  }

  .form-group--error .form--label {
    color: $validations-cRed;
    color: var(--cRed, $validations-cRed);
  }

  .form-error {
    margin-top: -0.7em;
    text-align: left;

    span {
      font-size: 0.85em;
    }
  }

  .form-error ul {
    list-style: none;
    padding: 0 0 0 5px;
    margin-top: 0;

    li::before {
      content: "• ";
    }
  }

  form textarea {
    line-height: 16px;
    resize: vertical;
  }

  .captcha {
    max-width: 350px;
    margin-bottom: 0.4em;
  }

  .btn {
    margin-top: 0.6em;
    height: 2em;
  }

  .error {
    text-align: center;
  }
}

@media all and (max-width: 800px) {
  .registration-form .container {
    flex-direction: column-reverse;
  }
}
</style>
