import Completion from '../../services/completion/completion.js'
import genRandomSeed from '../../services/random_seed/random_seed.service.js'
import EmojiPicker from '../emoji_picker/emoji_picker.vue'
import Popover from 'src/components/popover/popover.vue'
import ScreenReaderNotice from 'src/components/screen_reader_notice/screen_reader_notice.vue'
import UnicodeDomainIndicator from '../unicode_domain_indicator/unicode_domain_indicator.vue'
import { take } from 'lodash'
import { findOffset } from '../../services/offset_finder/offset_finder.service.js'
import { ensureFinalFallback } from '../../i18n/languages.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faSmileBeam
} from '@fortawesome/free-regular-svg-icons'

library.add(
  faSmileBeam
)

/**
 * EmojiInput - augmented inputs for emoji and autocomplete support in inputs
 * without having to give up the comfort of <input/> and <textarea/> elements
 *
 * Intended usage is:
 * <EmojiInput v-model="something">
 *   <input v-model="something"/>
 * </EmojiInput>
 *
 * Works only with <input> and <textarea>. Intended to use with only one nested
 * input. It will find first input or textarea and work with that, multiple
 * nested children not tested. You HAVE TO duplicate v-model for both
 * <emoji-input> and <input>/<textarea> otherwise it will not work.
 *
 * Be prepared for CSS troubles though because it still wraps component in a div
 * while TRYING to make it look like nothing happened, but it could break stuff.
 */

const EmojiInput = {
  emits: ['update:modelValue', 'shown'],
  props: {
    suggest: {
      /**
       * suggest: function (input: String) => Suggestion[]
       *
       * Function that takes input string which takes string (textAtCaret)
       * and returns an array of Suggestions
       *
       * Suggestion is an object containing following properties:
       * displayText: string. Main display text, what actual suggestion
       *    represents (user's screen name/emoji shortcode)
       * replacement: string. Text that should replace the textAtCaret
       * detailText: string, optional. Subtitle text, providing additional info
       *    if present (user's nickname)
       * imageUrl: string, optional. Image to display alongside with suggestion,
       *    currently if no image is provided, replacement will be used (for
       *    unicode emojis)
       *
       * TODO: make it asynchronous when adding proper server-provided user
       * suggestions
       *
       * For commonly used suggestors (emoji, users, both) use suggestor.js
       */
      required: true,
      type: Function
    },
    modelValue: {
      /**
       * Used for v-model
       */
      required: true,
      type: String
    },
    enableEmojiPicker: {
      /**
       * Enables emoji picker support, this implies that custom emoji are supported
       */
      required: false,
      type: Boolean,
      default: false
    },
    hideEmojiButton: {
      /**
       * intended to use with external picker trigger, i.e. you have a button outside
       * input that will open up the picker, see triggerShowPicker()
       */
      required: false,
      type: Boolean,
      default: false
    },
    enableStickerPicker: {
      /**
       * Enables sticker picker support, only makes sense when enableEmojiPicker=true
       */
      required: false,
      type: Boolean,
      default: false
    },
    placement: {
      /**
       * Forces the panel to take a specific position relative to the input element.
       * The 'auto' placement chooses either bottom or top depending on which has the available space (when both have available space, bottom is preferred).
       */
      required: false,
      type: String, // 'auto', 'top', 'bottom'
      default: 'auto'
    },
    newlineOnCtrlEnter: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      randomSeed: genRandomSeed(),
      input: undefined,
      caretEl: undefined,
      highlighted: -1,
      caret: 0,
      focused: false,
      blurTimeout: null,
      temporarilyHideSuggestions: false,
      disableClickOutside: false,
      suggestions: [],
      overlayStyle: {},
      pickerShown: false
    }
  },
  components: {
    Popover,
    EmojiPicker,
    UnicodeDomainIndicator,
    ScreenReaderNotice
  },
  computed: {
    padEmoji () {
      return this.$store.getters.mergedConfig.padEmoji
    },
    defaultCandidateIndex () {
      return this.$store.getters.mergedConfig.autocompleteSelect ? 0 : -1
    },
    preText () {
      return this.modelValue.slice(0, this.caret)
    },
    postText () {
      return this.modelValue.slice(this.caret)
    },
    showSuggestions () {
      return this.focused &&
        this.suggestions &&
        this.suggestions.length > 0 &&
        !this.pickerShown &&
        !this.temporarilyHideSuggestions
    },
    textAtCaret () {
      return this.wordAtCaret?.word
    },
    wordAtCaret () {
      if (this.modelValue && this.caret) {
        const word = Completion.wordAtPosition(this.modelValue, this.caret - 1) || {}
        return word
      }
    },
    languages () {
      return ensureFinalFallback(this.$store.getters.mergedConfig.interfaceLanguage)
    },
    maybeLocalizedEmojiNamesAndKeywords () {
      return emoji => {
        const names = [emoji.displayText]
        const keywords = []

        if (emoji.displayTextI18n) {
          names.push(this.$t(emoji.displayTextI18n.key, emoji.displayTextI18n.args))
        }

        if (emoji.annotations) {
          this.languages.forEach(lang => {
            names.push(emoji.annotations[lang]?.name)

            keywords.push(...(emoji.annotations[lang]?.keywords || []))
          })
        }

        return {
          names: names.filter(k => k),
          keywords: keywords.filter(k => k)
        }
      }
    },
    maybeLocalizedEmojiName () {
      return emoji => {
        if (!emoji.annotations) {
          return emoji.displayText
        }

        if (emoji.displayTextI18n) {
          return this.$t(emoji.displayTextI18n.key, emoji.displayTextI18n.args)
        }

        for (const lang of this.languages) {
          if (emoji.annotations[lang]?.name) {
            return emoji.annotations[lang].name
          }
        }

        return emoji.displayText
      }
    },
    onInputScroll () {
      this.$refs.hiddenOverlay.scrollTo({
        top: this.input.scrollTop,
        left: this.input.scrollLeft
      })
    },
    suggestionListId () {
      return `suggestions-${this.randomSeed}`
    },
    suggestionItemId () {
      return (index) => `suggestion-item-${index}-${this.randomSeed}`
    }
  },
  mounted () {
    const { root, hiddenOverlayCaret, suggestorPopover } = this.$refs
    const input = root.querySelector('.emoji-input > input') || root.querySelector('.emoji-input > textarea')
    if (!input) return
    this.input = input
    this.caretEl = hiddenOverlayCaret
    if (suggestorPopover.setAnchorEl) {
      suggestorPopover.setAnchorEl(this.caretEl) // unit test compat
      this.$refs.picker.setAnchorEl(this.caretEl)
    } else {
      console.warn('setAnchorEl not found, are we in a unit test?')
    }
    const style = getComputedStyle(this.input)
    this.overlayStyle.padding = style.padding
    this.overlayStyle.border = style.border
    this.overlayStyle.margin = style.margin
    this.overlayStyle.lineHeight = style.lineHeight
    this.overlayStyle.fontFamily = style.fontFamily
    this.overlayStyle.fontSize = style.fontSize
    this.overlayStyle.wordWrap = style.wordWrap
    this.overlayStyle.whiteSpace = style.whiteSpace
    this.resize()
    input.addEventListener('blur', this.onBlur)
    input.addEventListener('focus', this.onFocus)
    input.addEventListener('paste', this.onPaste)
    input.addEventListener('keyup', this.onKeyUp)
    input.addEventListener('keydown', this.onKeyDown)
    input.addEventListener('click', this.onClickInput)
    input.addEventListener('transitionend', this.onTransition)
    input.addEventListener('input', this.onInput)
    input.addEventListener('scroll', this.onInputScroll)
  },
  unmounted () {
    const { input } = this
    if (input) {
      input.removeEventListener('blur', this.onBlur)
      input.removeEventListener('focus', this.onFocus)
      input.removeEventListener('paste', this.onPaste)
      input.removeEventListener('keyup', this.onKeyUp)
      input.removeEventListener('keydown', this.onKeyDown)
      input.removeEventListener('click', this.onClickInput)
      input.removeEventListener('transitionend', this.onTransition)
      input.removeEventListener('input', this.onInput)
      input.removeEventListener('scroll', this.onInputScroll)
    }
  },
  watch: {
    showSuggestions: function (newValue, oldValue) {
      this.$emit('shown', newValue)
      if (newValue) {
        this.$refs.suggestorPopover.showPopover()
      } else {
        this.$refs.suggestorPopover.hidePopover()
      }
    },
    textAtCaret: async function (newWord) {
      if (newWord === undefined) return
      const firstchar = newWord.charAt(0)
      if (newWord === firstchar) {
        this.suggestions = []
        return
      }
      const matchedSuggestions = await this.suggest(newWord, this.maybeLocalizedEmojiNamesAndKeywords)
      // Async: cancel if textAtCaret has changed during wait
      if (this.textAtCaret !== newWord || matchedSuggestions.length <= 0) {
        this.suggestions = []
        return
      }
      this.suggestions = take(matchedSuggestions, 5)
        .map(({ imageUrl, ...rest }) => ({
          ...rest,
          img: imageUrl || ''
        }))
      this.highlighted = this.defaultCandidateIndex
      this.$refs.screenReaderNotice.announce(
        this.$tc('tool_tip.autocomplete_available',
          this.suggestions.length,
          { number: this.suggestions.length }))
    }
  },
  methods: {
    triggerShowPicker () {
      this.$nextTick(() => {
        this.$refs.picker.showPicker()
        this.scrollIntoView()
      })
      // This temporarily disables "click outside" handler
      // since external trigger also means click originates
      // from outside, thus preventing picker from opening
      this.disableClickOutside = true
      setTimeout(() => {
        this.disableClickOutside = false
      }, 0)
    },
    togglePicker () {
      this.input.focus()
      if (!this.pickerShown) {
        this.scrollIntoView()
        this.$refs.picker.showPicker()
        this.$refs.picker.startEmojiLoad()
      } else {
        this.$refs.picker.hidePicker()
      }
    },
    replace (replacement) {
      const newValue = Completion.replaceWord(this.modelValue, this.wordAtCaret, replacement)
      this.$emit('update:modelValue', newValue)
      this.caret = 0
    },
    insert ({ insertion, keepOpen, surroundingSpace = true }) {
      const before = this.modelValue.substring(0, this.caret) || ''
      const after = this.modelValue.substring(this.caret) || ''

      /* Using a bit more smart approach to padding emojis with spaces:
       * - put a space before cursor if there isn't one already, unless we
       *   are at the beginning of post or in spam mode
       * - put a space after emoji if there isn't one already unless we are
       *   in spam mode
       *
       * The idea is that when you put a cursor somewhere in between sentence
       * inserting just ' :emoji: ' will add more spaces to post which might
       * break the flow/spacing, as well as the case where user ends sentence
       * with a space before adding emoji.
       *
       * Spam mode is intended for creating multi-part emojis and overall spamming
       * them, masto seem to be rendering :emoji::emoji: correctly now so why not
       */
      const isSpaceRegex = /\s/
      const spaceBefore = (surroundingSpace && !isSpaceRegex.exec(before.slice(-1)) && before.length && this.padEmoji > 0) ? ' ' : ''
      const spaceAfter = (surroundingSpace && !isSpaceRegex.exec(after[0]) && this.padEmoji) ? ' ' : ''

      const newValue = [
        before,
        spaceBefore,
        insertion,
        spaceAfter,
        after
      ].join('')
      this.$emit('update:modelValue', newValue)
      const position = this.caret + (insertion + spaceAfter + spaceBefore).length
      if (!keepOpen) {
        this.input.focus()
      }

      this.$nextTick(function () {
        // Re-focus inputbox after clicking suggestion
        // Set selection right after the replacement instead of the very end
        this.input.setSelectionRange(position, position)
        this.caret = position
      })
    },
    replaceText (e, suggestion) {
      const len = this.suggestions.length || 0
      if (this.textAtCaret.length === 1) { return }
      if (len > 0 || suggestion) {
        const chosenSuggestion = suggestion || this.suggestions[this.highlighted]
        const replacement = chosenSuggestion.replacement
        const newValue = Completion.replaceWord(this.modelValue, this.wordAtCaret, replacement)
        this.$emit('update:modelValue', newValue)
        this.highlighted = 0
        const position = this.wordAtCaret.start + replacement.length

        this.$nextTick(function () {
          // Re-focus inputbox after clicking suggestion
          this.input.focus()
          // Set selection right after the replacement instead of the very end
          this.input.setSelectionRange(position, position)
          this.caret = position
        })
        e.preventDefault()
      }
    },
    cycleBackward (e) {
      const len = this.suggestions.length || 0

      this.highlighted -= 1
      if (this.highlighted === -1) {
        this.input.focus()
      } else if (this.highlighted < -1) {
        this.highlighted = len - 1
      }
      if (len > 0) {
        e.preventDefault()
      }
    },
    cycleForward (e) {
      const len = this.suggestions.length || 0

      this.highlighted += 1
      if (this.highlighted >= len) {
        this.highlighted = -1
        this.input.focus()
      }
      if (len > 0) {
        e.preventDefault()
      }
    },
    scrollIntoView () {
      const rootRef = this.$refs.picker.$el
      /* Scroller is either `window` (replies in TL), sidebar (main post form,
       * replies in notifs) or mobile post form. Note that getting and setting
       * scroll is different for `Window` and `Element`s
       */
      const scrollerRef = this.$el.closest('.sidebar-scroller') ||
            this.$el.closest('.post-form-modal-view') ||
            window
      const currentScroll = scrollerRef === window
        ? scrollerRef.scrollY
        : scrollerRef.scrollTop
      const scrollerHeight = scrollerRef === window
        ? scrollerRef.innerHeight
        : scrollerRef.offsetHeight

      const scrollerBottomBorder = currentScroll + scrollerHeight
      // We check where the bottom border of root element is, this uses findOffset
      // to find offset relative to scrollable container (scroller)
      const rootBottomBorder = rootRef.offsetHeight + findOffset(rootRef, scrollerRef).top

      const bottomDelta = Math.max(0, rootBottomBorder - scrollerBottomBorder)
      // could also check top delta but there's no case for it
      const targetScroll = currentScroll + bottomDelta

      if (scrollerRef === window) {
        scrollerRef.scroll(0, targetScroll)
      } else {
        scrollerRef.scrollTop = targetScroll
      }

      this.$nextTick(() => {
        const { offsetHeight } = this.input
        const { picker } = this.$refs
        const pickerBottom = picker.$el.getBoundingClientRect().bottom
        if (pickerBottom > window.innerHeight) {
          picker.$el.style.top = 'auto'
          picker.$el.style.bottom = offsetHeight + 'px'
        }
      })
    },
    onPickerShown () {
      this.pickerShown = true
    },
    onPickerClosed () {
      this.pickerShown = false
    },
    onBlur (e) {
      // Clicking on any suggestion removes focus from autocomplete,
      // preventing click handler ever executing.
      this.blurTimeout = setTimeout(() => {
        this.focused = false
        this.setCaret(e)
      }, 200)
    },
    onClick (e, suggestion) {
      this.replaceText(e, suggestion)
    },
    onFocus (e) {
      if (this.blurTimeout) {
        clearTimeout(this.blurTimeout)
        this.blurTimeout = null
      }

      this.focused = true
      this.setCaret(e)
      this.temporarilyHideSuggestions = false
    },
    onKeyUp (e) {
      const { key } = e
      this.setCaret(e)

      // Setting hider in keyUp to prevent suggestions from blinking
      // when moving away from suggested spot
      if (key === 'Escape') {
        this.temporarilyHideSuggestions = true
      } else {
        this.temporarilyHideSuggestions = false
      }
    },
    onPaste (e) {
      this.setCaret(e)
    },
    onKeyDown (e) {
      const { ctrlKey, shiftKey, key } = e
      if (this.newlineOnCtrlEnter && ctrlKey && key === 'Enter') {
        this.insert({ insertion: '\n', surroundingSpace: false })
        // Ensure only one new line is added on macos
        e.stopPropagation()
        e.preventDefault()

        // Scroll the input element to the position of the cursor
        this.$nextTick(() => {
          this.input.blur()
          this.input.focus()
        })
      }
      // Disable suggestions hotkeys if suggestions are hidden
      if (!this.temporarilyHideSuggestions) {
        if (key === 'Tab') {
          if (shiftKey) {
            this.cycleBackward(e)
          } else {
            this.cycleForward(e)
          }
        }
        if (key === 'ArrowUp') {
          this.cycleBackward(e)
        } else if (key === 'ArrowDown') {
          this.cycleForward(e)
        }
        if (key === 'Enter') {
          if (!ctrlKey) {
            this.replaceText(e)
          }
        }
      }
      // Probably add optional keyboard controls for emoji picker?

      // Escape hides suggestions, if suggestions are hidden it
      // de-focuses the element (i.e. default browser behavior)
      if (key === 'Escape') {
        if (!this.temporarilyHideSuggestions) {
          this.input.focus()
        }
      }
    },
    onInput (e) {
      this.setCaret(e)
      this.$emit('update:modelValue', e.target.value)
    },
    onStickerUploaded (e) {
      this.$emit('sticker-uploaded', e)
    },
    onStickerUploadFailed (e) {
      this.$emit('sticker-upload-Failed', e)
    },
    setCaret ({ target: { selectionStart } }) {
      this.caret = selectionStart
      this.$nextTick(() => {
        this.$refs.suggestorPopover.updateStyles()
      })
    },
    resize () {
    },
    autoCompleteItemLabel (suggestion) {
      if (suggestion.user) {
        return suggestion.displayText + ' ' + suggestion.detailText
      } else {
        return this.maybeLocalizedEmojiName(suggestion)
      }
    }
  }
}

export default EmojiInput
