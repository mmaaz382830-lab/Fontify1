// content.js — injected into the active tab.
//
// On hover it reads computed font styles and:
//   (A) draws a floating tooltip on the page next to the cursor, and
//   (B) saves the latest reading to chrome.storage so the popup can show it
//       even after it has been closed and reopened.
// It also messages the popup live (when the popup happens to be open).
//
// Re-injecting toggles inspection OFF (acts like a stop button).

;(() => {
  const STATE = '__typographyInspector'

  // If already running, treat a second injection as "stop".
  if (window[STATE] && window[STATE].active) {
    window[STATE].stop()
    return
  }

  /* ----------------------------------------------------------------------- */
  /*  Build the floating tooltip element                                     */
  /* ----------------------------------------------------------------------- */
  const tip = document.createElement('div')
  tip.id = 'typography-inspector-tooltip'
  Object.assign(tip.style, {
    position: 'fixed',
    zIndex: '2147483647', // max — stay above everything
    pointerEvents: 'none', // never block the page or hover
    maxWidth: '300px',
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'rgba(10,10,10,0.96)',
    color: '#fafafa',
    border: '1px solid #333',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    font: '12px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backdropFilter: 'blur(4px)',
    transition: 'opacity 0.08s ease',
    opacity: '0',
  })
  document.documentElement.appendChild(tip)

  const row = (label, value, extra = '') =>
    `<div style="display:flex;justify-content:space-between;gap:14px;margin:2px 0;">
       <span style="color:#888;text-transform:uppercase;font-size:10px;letter-spacing:.04em;">${label}</span>
       <span style="font-family:ui-monospace,Menlo,Consolas,monospace;text-align:right;word-break:break-word;">${extra}${value}</span>
     </div>`

  const swatch = (color) =>
    `<span style="display:inline-block;width:10px;height:10px;border-radius:3px;border:1px solid #555;background:${color};margin-right:6px;vertical-align:middle;"></span>`

  /* ----------------------------------------------------------------------- */
  /*  Helpers                                                                */
  /* ----------------------------------------------------------------------- */
  // Trim a long font-family stack to the first family for the tooltip.
  const firstFamily = (stack) =>
    stack.split(',')[0].replace(/['"]/g, '').trim()

  let lastTarget = null

  const positionTip = (x, y) => {
    const pad = 16
    const rect = tip.getBoundingClientRect()
    let left = x + pad
    let top = y + pad
    // Flip if it would overflow the viewport.
    if (left + rect.width > window.innerWidth) left = x - rect.width - pad
    if (top + rect.height > window.innerHeight) top = y - rect.height - pad
    tip.style.left = Math.max(4, left) + 'px'
    tip.style.top = Math.max(4, top) + 'px'
  }

  const handleMove = (event) => {
    positionTip(event.clientX, event.clientY)
  }

  const handleMouseOver = (event) => {
    const target = event.target
    if (
      !(target instanceof Element) ||
      target === tip ||
      target === lastTarget
    )
      return
    lastTarget = target

    const s = window.getComputedStyle(target)
    const payload = {
      tag: target.tagName.toLowerCase(),
      fontFamily: s.fontFamily,
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      color: s.color,
      at: Date.now(),
    }

    // (A) Update the floating tooltip.
    tip.innerHTML =
      `<div style="font-weight:600;margin-bottom:6px;color:#fafafa;">
         &lt;${payload.tag}&gt;
       </div>` +
      row('Family', firstFamily(payload.fontFamily)) +
      row('Size', payload.fontSize) +
      row('Weight', payload.fontWeight) +
      row('Color', payload.color, swatch(payload.color))
    tip.style.opacity = '1'

    // (B) Persist the latest reading for the popup.
    try {
      chrome.storage.local.set({ lastFontInfo: payload })
    } catch (e) {
      /* storage may be unavailable; ignore */
    }

    // Live update the popup if it's open.
    try {
      chrome.runtime.sendMessage({ type: 'FONT_INFO', payload })
    } catch (e) {
      /* popup closed — fine, storage still has it */
    }
  }

  /* ----------------------------------------------------------------------- */
  /*  Start / stop                                                           */
  /* ----------------------------------------------------------------------- */
  const start = () => {
    document.addEventListener('mouseover', handleMouseOver, true)
    document.addEventListener('mousemove', handleMove, true)
    document.addEventListener('keydown', onKey, true)
    window[STATE].active = true
    try {
      chrome.storage.local.set({ inspecting: true })
    } catch (e) {}
  }

  const stop = () => {
    document.removeEventListener('mouseover', handleMouseOver, true)
    document.removeEventListener('mousemove', handleMove, true)
    document.removeEventListener('keydown', onKey, true)
    tip.remove()
    window[STATE].active = false
    try {
      chrome.storage.local.set({ inspecting: false })
    } catch (e) {}
  }

  // Press Escape to stop inspecting.
  const onKey = (e) => {
    if (e.key === 'Escape') stop()
  }

  window[STATE] = { active: false, stop }
  start()
})()
