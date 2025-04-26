const Popover = {
  name: 'Popover',
  props: {
    // Action to trigger popover: either 'hover' or 'click'
    trigger: String,

    // 'top', 'bottom', 'left', 'right'
    placement: String,

    // Takes object with properties 'x' and 'y', values of these can be
    // 'container' for using offsetParent as boundaries for either axis
    // or 'viewport'
    boundTo: Object,

    // Takes a selector to use as a replacement for the parent container
    // for getting boundaries for x an y axis
    boundToSelector: String,

    // Takes a top/bottom/left/right object, how much space to leave
    // between boundary and popover element
    margin: Object,

    // Takes a x/y object and tells how many pixels to offset from
    // anchor point on either axis
    offset: Object,

    // Replaces the classes you may want for the popover container.
    // Use 'popover-default' in addition to get the default popover
    // styles with your custom class.
    popoverClass: String,

    // If true, subtract padding when calculating position for the popover,
    // use it when popover offset looks to be different on top vs bottom.
    removePadding: Boolean,

    // self-explanatory (i hope)
    disabled: Boolean,

    // Instead of putting popover next to anchor, overlay popover's center on top of anchor's center
    overlayCenters: Boolean,

    // What selector (witin popover!) to use for determining center of popover
    overlayCentersSelector: String,

    // Lets hover popover stay when clicking inside of it
    stayOnClick: Boolean,

    // Use styled button (to avoid nested buttons)
    normalButton: Boolean,

    triggerAttrs: {
      type: Object,
      default: {}
    }
  },
  inject: ['popoversZLayer'], // override popover z layer
  data () {
    return {
      // lockReEntry is a flag that is set when mouse cursor is leaving the popover's content
      // so that if mouse goes back into popover it won't be re-shown again to prevent annoyance
      // with popovers refusing to be hidden when user wants to interact with something in below popover
      anchorEl: null,
      // There's an issue where having teleport enabled by default causes things just...
      // not render at all, i.e. main post status form and its emoji inputs
      teleport: false,
      lockReEntry: false,
      hidden: true,
      styles: {},
      oldSize: { width: 0, height: 0 },
      scrollable: null,
      // used to avoid blinking if hovered onto popover
      graceTimeout: null,
      parentPopover: null,
      disableClickOutside: false,
      childrenShown: new Set()
    }
  },
  methods: {
    setAnchorEl (el) {
      this.anchorEl = el
      this.updateStyles()
    },
    containerBoundingClientRect () {
      const container = this.boundToSelector ? this.$el.closest(this.boundToSelector) : this.$el.offsetParent
      return container.getBoundingClientRect()
    },
    updateStyles () {
      if (this.hidden) {
        this.styles = {}
        return
      }

      // Popover will be anchored around this element, trigger ref is the container, so
      // its children are what are inside the slot. Expect only one v-slot:trigger.
      const anchorEl = this.anchorEl || (this.$refs.trigger && this.$refs.trigger.children[0]) || this.$el
      // SVGs don't have offsetWidth/Height, use fallback
      const anchorHeight = anchorEl.offsetHeight || anchorEl.clientHeight
      const anchorWidth = anchorEl.offsetWidth || anchorEl.clientWidth
      const anchorScreenBox = anchorEl.getBoundingClientRect()

      const anchorStyle = getComputedStyle(anchorEl)
      const topPadding = parseFloat(anchorStyle.paddingTop)
      const bottomPadding = parseFloat(anchorStyle.paddingBottom)
      const rightPadding = parseFloat(anchorStyle.paddingRight)
      const leftPadding = parseFloat(anchorStyle.paddingLeft)

      // Screen position of the origin point for popover = center of the anchor
      const origin = {
        x: anchorScreenBox.left + anchorWidth * 0.5,
        y: anchorScreenBox.top + anchorHeight * 0.5
      }
      const content = this.$refs.content
      const overlayCenter = this.overlayCenters
        ? this.$refs.content.querySelector(this.overlayCentersSelector)
        : null

      // Minor optimization, don't call a slow reflow call if we don't have to
      const parentScreenBox = this.boundTo &&
        (this.boundTo.x === 'container' || this.boundTo.y === 'container') &&
        this.containerBoundingClientRect()

      const margin = this.margin || {}

      // What are the screen bounds for the popover? Viewport vs container
      // when using viewport, using default margin values to dodge the navbar
      const xBounds = this.boundTo && this.boundTo.x === 'container'
        ? {
            min: parentScreenBox.left + (margin.left || 0),
            max: parentScreenBox.right - (margin.right || 0)
          }
        : {
            min: 0 + (margin.left || 10),
            max: window.innerWidth - (margin.right || 10)
          }

      const yBounds = this.boundTo && this.boundTo.y === 'container'
        ? {
            min: parentScreenBox.top + (margin.top || 0),
            max: parentScreenBox.bottom - (margin.bottom || 0)
          }
        : {
            min: 0 + (margin.top || 50),
            max: window.innerHeight - (margin.bottom || 5)
          }

      let horizOffset = 0
      let vertOffset = 0

      if (overlayCenter) {
        const box = content.getBoundingClientRect()
        const overlayCenterScreenBox = overlayCenter.getBoundingClientRect()
        const leftInnerOffset = overlayCenterScreenBox.left - box.left
        const topInnerOffset = overlayCenterScreenBox.top - box.top
        horizOffset = -leftInnerOffset - overlayCenter.offsetWidth * 0.5
        vertOffset = -topInnerOffset - overlayCenter.offsetHeight * 0.5
      } else {
        horizOffset = content.offsetWidth * -0.5
        vertOffset = content.offsetHeight * -0.5
      }

      const leftBorder = origin.x + horizOffset
      const rightBorder = leftBorder + content.offsetWidth
      const topBorder = origin.y + vertOffset
      const bottomBorder = topBorder + content.offsetHeight

      // If overflowing from left, move it so that it doesn't
      if (leftBorder < xBounds.min) {
        horizOffset += xBounds.min - leftBorder
      }

      // If overflowing from right, move it so that it doesn't
      if (rightBorder > xBounds.max) {
        horizOffset -= rightBorder - xBounds.max
      }

      // If overflowing from top, move it so that it doesn't
      if (topBorder < yBounds.min) {
        vertOffset += yBounds.min - topBorder
      }

      // If overflowing from bottom, move it so that it doesn't
      if (bottomBorder > yBounds.max) {
        vertOffset -= bottomBorder - yBounds.max
      }

      let translateX = 0
      let translateY = 0

      if (overlayCenter) {
        translateX = origin.x + horizOffset
        translateY = origin.y + vertOffset
      } else if (this.placement !== 'right' && this.placement !== 'left') {
        // Default to whatever user wished with placement prop
        let usingTop = this.placement !== 'bottom'

        // Handle special cases, first force to displaying on top if there's not space on bottom,
        // regardless of what placement value was. Then check if there's not space on top, and
        // force to bottom, again regardless of what placement value was.
        const topBoundary = origin.y - anchorHeight * 0.5 + (this.removePadding ? topPadding : 0)
        const bottomBoundary = origin.y + anchorHeight * 0.5 - (this.removePadding ? bottomPadding : 0)
        if (bottomBoundary + content.offsetHeight > yBounds.max) usingTop = true
        if (topBoundary - content.offsetHeight < yBounds.min) usingTop = false

        const yOffset = (this.offset && this.offset.y) || 0
        translateY = usingTop
          ? topBoundary - yOffset - content.offsetHeight
          : bottomBoundary + yOffset

        const xOffset = (this.offset && this.offset.x) || 0
        translateX = origin.x + horizOffset + xOffset
      } else {
        // Default to whatever user wished with placement prop
        let usingRight = this.placement !== 'left'

        // Handle special cases, first force to displaying on top if there's not space on bottom,
        // regardless of what placement value was. Then check if there's not space on top, and
        // force to bottom, again regardless of what placement value was.
        const rightBoundary = origin.x - anchorWidth * 0.5 + (this.removePadding ? rightPadding : 0)
        const leftBoundary = origin.x + anchorWidth * 0.5 - (this.removePadding ? leftPadding : 0)
        if (leftBoundary + content.offsetWidth > xBounds.max) usingRight = true
        if (rightBoundary - content.offsetWidth < xBounds.min) usingRight = false

        const xOffset = (this.offset && this.offset.x) || 0
        translateX = usingRight
          ? rightBoundary - xOffset - content.offsetWidth
          : leftBoundary + xOffset

        const yOffset = (this.offset && this.offset.y) || 0
        translateY = origin.y + vertOffset + yOffset
      }

      this.styles = {
        left: `${Math.round(translateX)}px`,
        top: `${Math.round(translateY)}px`
      }

      if (this.popoversZLayer) {
        this.styles['--ZI_popover_override'] = `var(--ZI_${this.popoversZLayer}_popovers)`
      }
      if (parentScreenBox) {
        this.styles.maxWidth = `${Math.round(parentScreenBox.width)}px`
      }
    },
    showPopover () {
      if (this.disabled) return
      this.disableClickOutside = true
      setTimeout(() => {
        this.disableClickOutside = false
      }, 0)
      const wasHidden = this.hidden
      this.hidden = false
      this.parentPopover && this.parentPopover.onChildPopoverState(this, true)
      if (this.trigger === 'click' || this.stayOnClick) {
        document.addEventListener('click', this.onClickOutside)
      }
      this.scrollable.addEventListener('scroll', this.onScroll)
      this.scrollable.addEventListener('resize', this.onResize)
      this.$nextTick(() => {
        if (wasHidden) this.$emit('show')
        this.updateStyles()
      })
    },
    hidePopover () {
      if (this.disabled) return
      if (!this.hidden) this.$emit('close')
      this.hidden = true
      this.parentPopover && this.parentPopover.onChildPopoverState(this, false)
      if (this.trigger === 'click') {
        document.removeEventListener('click', this.onClickOutside)
      }
      this.scrollable.removeEventListener('scroll', this.onScroll)
      this.scrollable.removeEventListener('resize', this.onResize)
    },
    onMouseenter (e) {
      if (this.trigger === 'hover') {
        this.lockReEntry = false
        clearTimeout(this.graceTimeout)
        this.graceTimeout = null
        this.showPopover()
      }
    },
    onMouseleave (e) {
      if (this.trigger === 'hover' && this.childrenShown.size === 0) {
        this.graceTimeout = setTimeout(() => this.hidePopover(), 1)
      }
    },
    onMouseenterContent (e) {
      if (this.trigger === 'hover' && !this.lockReEntry) {
        this.lockReEntry = true
        clearTimeout(this.graceTimeout)
        this.graceTimeout = null
        this.showPopover()
      }
    },
    onMouseleaveContent (e) {
      if (this.trigger === 'hover' && this.childrenShown.size === 0) {
        this.graceTimeout = setTimeout(() => this.hidePopover(), 1)
      }
    },
    onClick (e) {
      if (this.trigger === 'click') {
        if (this.hidden) {
          this.showPopover()
        } else {
          this.hidePopover()
        }
      }
    },
    onClickOutside (e) {
      if (this.disableClickOutside) return
      if (this.hidden) return
      if (this.$refs.content && this.$refs.content.contains(e.target)) return
      if (this.$el.contains(e.target)) return
      if (this.childrenShown.size > 0) return
      this.hidePopover()
      if (this.parentPopover) this.parentPopover.onClickOutside(e)
    },
    onScroll (e) {
      this.updateStyles()
    },
    onResize (e) {
      this.updateStyles()
    },
    onChildPopoverState (childRef, state) {
      if (state) {
        this.childrenShown.add(childRef)
      } else {
        this.childrenShown.delete(childRef)
      }
    }
  },
  updated () {
    // Monitor changes to content size, update styles only when content sizes have changed,
    // that should be the only time we need to move the popover box if we don't care about scroll
    // or resize
    const content = this.$refs.content
    if (!content) return
    if (this.oldSize.width !== content.offsetWidth || this.oldSize.height !== content.offsetHeight) {
      this.updateStyles()
      this.oldSize = { width: content.offsetWidth, height: content.offsetHeight }
    }
  },
  mounted () {
    this.teleport = true
    let scrollable = this.$refs.trigger.closest('.column.-scrollable') ||
        this.$refs.trigger.closest('.mobile-notifications')
    if (!scrollable) scrollable = window
    this.scrollable = scrollable
    let parent = this.$parent
    while (parent && parent.$.type.name !== 'Popover') {
      parent = parent.$parent
    }
    this.parentPopover = parent
  },
  beforeUnmount () {
    this.hidePopover()
  }
}

export default Popover
