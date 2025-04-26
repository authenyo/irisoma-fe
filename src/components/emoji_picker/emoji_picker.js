import { defineAsyncComponent } from 'vue'
import Checkbox from '../checkbox/checkbox.vue'
import Popover from 'src/components/popover/popover.vue'
import StillImage from '../still-image/still-image.vue'
import { ensureFinalFallback } from '../../i18n/languages.js'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faBoxOpen,
  faStickyNote,
  faSmileBeam,
  faSmile,
  faUser,
  faPaw,
  faIceCream,
  faBus,
  faBasketballBall,
  faLightbulb,
  faCode,
  faFlag
} from '@fortawesome/free-solid-svg-icons'
import { debounce, trim, chunk } from 'lodash'

library.add(
  faBoxOpen,
  faStickyNote,
  faSmileBeam,
  faSmile,
  faUser,
  faPaw,
  faIceCream,
  faBus,
  faBasketballBall,
  faLightbulb,
  faCode,
  faFlag
)

const UNICODE_EMOJI_GROUP_ICON = {
  'smileys-and-emotion': 'smile',
  'people-and-body': 'user',
  'animals-and-nature': 'paw',
  'food-and-drink': 'ice-cream',
  'travel-and-places': 'bus',
  activities: 'basketball-ball',
  objects: 'lightbulb',
  symbols: 'code',
  flags: 'flag'
}

const maybeLocalizedKeywords = (emoji, languages, nameLocalizer) => {
  const res = [emoji.displayText, nameLocalizer(emoji)]
  if (emoji.annotations) {
    languages.forEach(lang => {
      const keywords = emoji.annotations[lang]?.keywords || []
      const name = emoji.annotations[lang]?.name
      res.push(...(keywords.concat([name]).filter(k => k)))
    })
  }
  return res
}

const filterByKeyword = (list, keyword = '', languages, nameLocalizer) => {
  if (keyword === '') return list

  const keywordLowercase = keyword.toLowerCase()
  const orderedEmojiList = []
  for (const emoji of list) {
    const indices = maybeLocalizedKeywords(emoji, languages, nameLocalizer)
      .map(k => k.toLowerCase().indexOf(keywordLowercase))
      .filter(k => k > -1)

    const indexOfKeyword = indices.length ? Math.min(...indices) : -1

    if (indexOfKeyword > -1) {
      if (!Array.isArray(orderedEmojiList[indexOfKeyword])) {
        orderedEmojiList[indexOfKeyword] = []
      }
      orderedEmojiList[indexOfKeyword].push(emoji)
    }
  }
  return orderedEmojiList.flat()
}

const getOffset = (elem) => {
  const style = elem.style.transform
  const res = /translateY\((\d+)px\)/.exec(style)
  if (!res) { return 0 }
  return res[1]
}

const toHeaderId = id => {
  return id.replace(/^row-\d+-/, '')
}

const EmojiPicker = {
  props: {
    enableStickerPicker: {
      required: false,
      type: Boolean,
      default: false
    },
    hideCustomEmoji: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  inject: ['popoversZLayer'],
  data () {
    return {
      keyword: '',
      activeGroup: 'custom',
      showingStickers: false,
      groupsScrolledClass: 'scrolled-top',
      keepOpen: false,
      customEmojiTimeout: null,
      // Lazy-load only after the first time `showing` becomes true.
      contentLoaded: false,
      groupRefs: {},
      emojiRefs: {},
      filteredEmojiGroups: [],
      width: 0
    }
  },
  components: {
    StickerPicker: defineAsyncComponent(() => import('../sticker_picker/sticker_picker.vue')),
    Checkbox,
    StillImage,
    Popover
  },
  methods: {
    showPicker () {
      this.$refs.popover.showPopover()
      this.onShowing()
    },
    hidePicker () {
      this.$refs.popover.hidePopover()
    },
    setAnchorEl (el) {
      this.$refs.popover.setAnchorEl(el)
    },
    setGroupRef (name) {
      return el => { this.groupRefs[name] = el }
    },
    onPopoverShown () {
      this.$emit('show')
    },
    onPopoverClosed () {
      this.$emit('close')
    },
    onStickerUploaded (e) {
      this.$emit('sticker-uploaded', e)
    },
    onStickerUploadFailed (e) {
      this.$emit('sticker-upload-failed', e)
    },
    onEmoji (emoji) {
      const value = emoji.imageUrl ? `:${emoji.displayText}:` : emoji.replacement
      if (!this.keepOpen) {
        this.$refs.popover.hidePopover()
      }
      this.$emit('emoji', { insertion: value, keepOpen: this.keepOpen })
    },
    onScroll (startIndex, endIndex, visibleStartIndex, visibleEndIndex) {
      const target = this.$refs['emoji-groups'].$el
      this.scrolledGroup(target, visibleStartIndex, visibleEndIndex)
    },
    scrolledGroup (target, start, end) {
      const top = target.scrollTop + 5
      this.$nextTick(() => {
        this.emojiItems.slice(start, end + 1).forEach(group => {
          const headerId = toHeaderId(group.id)
          const ref = this.groupRefs['group-' + group.id]
          if (!ref) { return }
          const elem = ref.$el.parentElement
          if (!elem) { return }
          if (elem && getOffset(elem) <= top) {
            this.activeGroup = headerId
          }
        })
        this.scrollHeader()
      })
    },
    scrollHeader () {
      // Scroll the active tab's header into view
      const headerRef = this.groupRefs['group-header-' + this.activeGroup]
      const left = headerRef.offsetLeft
      const right = left + headerRef.offsetWidth
      const headerCont = this.$refs.header
      const currentScroll = headerCont.scrollLeft
      const currentScrollRight = currentScroll + headerCont.clientWidth
      const setScroll = s => { headerCont.scrollLeft = s }

      const margin = 7 // .emoji-tabs-item: padding
      if (left - margin < currentScroll) {
        setScroll(left - margin)
      } else if (right + margin > currentScrollRight) {
        setScroll(right + margin - headerCont.clientWidth)
      }
    },
    highlight (groupId) {
      this.setShowStickers(false)
      const indexInList = this.emojiItems.findIndex(k => k.id === groupId)
      this.$refs['emoji-groups'].scrollToItem(indexInList)
    },
    updateScrolledClass (target) {
      if (target.scrollTop <= 5) {
        this.groupsScrolledClass = 'scrolled-top'
      } else if (target.scrollTop >= target.scrollTopMax - 5) {
        this.groupsScrolledClass = 'scrolled-bottom'
      } else {
        this.groupsScrolledClass = 'scrolled-middle'
      }
    },
    toggleStickers () {
      this.showingStickers = !this.showingStickers
    },
    setShowStickers (value) {
      this.showingStickers = value
    },
    filterByKeyword (list, keyword) {
      return filterByKeyword(list, keyword, this.languages, this.maybeLocalizedEmojiName)
    },
    onShowing () {
      const oldContentLoaded = this.contentLoaded
      this.recalculateItemPerRow()
      this.$nextTick(() => {
        this.$refs.search.focus()
      })
      this.contentLoaded = true
      this.filteredEmojiGroups = this.getFilteredEmojiGroups()
      if (!oldContentLoaded) {
        this.$nextTick(() => {
          if (this.defaultGroup) {
            this.highlight(this.defaultGroup)
          }
        })
      }
    },
    getFilteredEmojiGroups () {
      return this.allEmojiGroups
        .map(group => ({
          ...group,
          emojis: this.filterByKeyword(group.emojis, trim(this.keyword))
        }))
        .filter(group => group.emojis.length > 0)
    },
    recalculateItemPerRow () {
      this.$nextTick(() => {
        if (!this.$refs['emoji-groups']) {
          return
        }
        this.width = this.$refs['emoji-groups'].$el.clientWidth
      })
    }
  },
  watch: {
    keyword () {
      this.onScroll()
      this.debouncedHandleKeywordChange()
    },
    allCustomGroups () {
      this.filteredEmojiGroups = this.getFilteredEmojiGroups()
    }
  },
  computed: {
    minItemSize () {
      return this.emojiHeight
    },
    emojiHeight () {
      return 32 + 4
    },
    emojiWidth () {
      return 32 + 4
    },
    itemPerRow () {
      return this.width ? Math.floor(this.width / this.emojiWidth - 1) : 6
    },
    activeGroupView () {
      return this.showingStickers ? '' : this.activeGroup
    },
    stickersAvailable () {
      if (this.$store.state.instance.stickers) {
        return this.$store.state.instance.stickers.length > 0
      }
      return 0
    },
    allCustomGroups () {
      if (this.hideCustomEmoji) {
        return {}
      }
      const emojis = this.$store.getters.groupedCustomEmojis
      if (emojis.unpacked) {
        emojis.unpacked.text = this.$t('emoji.unpacked')
      }
      return emojis
    },
    defaultGroup () {
      return Object.keys(this.allCustomGroups)[0]
    },
    unicodeEmojiGroups () {
      return this.$store.getters.standardEmojiGroupList.map(group => ({
        id: `standard-${group.id}`,
        text: this.$t(`emoji.unicode_groups.${group.id}`),
        icon: UNICODE_EMOJI_GROUP_ICON[group.id],
        emojis: group.emojis
      }))
    },
    allEmojiGroups () {
      return Object.entries(this.allCustomGroups)
        .map(([_, v]) => v)
        .concat(this.unicodeEmojiGroups)
    },
    stickerPickerEnabled () {
      return (this.$store.state.instance.stickers || []).length !== 0
    },
    debouncedHandleKeywordChange () {
      return debounce(() => {
        this.filteredEmojiGroups = this.getFilteredEmojiGroups()
      }, 500)
    },
    emojiItems () {
      return this.filteredEmojiGroups.map(group =>
        chunk(group.emojis, this.itemPerRow)
          .map((items, index) => ({
            ...group,
            id: index === 0 ? group.id : `row-${index}-${group.id}`,
            emojis: items,
            isFirstRow: index === 0
          })))
        .reduce((a, c) => a.concat(c), [])
    },
    languages () {
      return ensureFinalFallback(this.$store.getters.mergedConfig.interfaceLanguage)
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
    isInModal () {
      return this.popoversZLayer === 'modals'
    }
  }
}

export default EmojiPicker
