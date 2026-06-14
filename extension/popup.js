// popup.js — controls the popup UI, injects the content script, and shows
// the latest font reading (live while open, and restored from storage on open).

const inspectBtn = document.getElementById('inspect')
const hint = document.getElementById('hint')
const empty = document.getElementById('empty')
const details = document.getElementById('details')

const fields = {
  fontFamily: document.getElementById('fontFamily'),
  fontSize: document.getElementById('fontSize'),
  fontWeight: document.getElementById('fontWeight'),
  color: document.getElementById('color'),
}

/* -------------------------------------------------------------------------- */
/*  Render helpers                                                             */
/* -------------------------------------------------------------------------- */

function render(data) {
  if (!data) return
  empty.hidden = true
  details.hidden = false

  fields.fontFamily.textContent = data.fontFamily
  fields.fontSize.textContent = data.fontSize
  fields.fontWeight.textContent = data.fontWeight

  // Color: swatch + value.
  fields.color.innerHTML = ''
  const swatch = document.createElement('span')
  swatch.className = 'swatch'
  swatch.style.background = data.color
  const colorText = document.createElement('span')
  colorText.textContent = data.color
  fields.color.appendChild(swatch)
  fields.color.appendChild(colorText)
}

function setInspectingUI(active) {
  if (active) {
    inspectBtn.textContent = 'Stop Inspecting'
    inspectBtn.classList.add('active')
    hint.textContent =
      'Hover any element on the page — a tooltip follows your cursor. ' +
      'Press Esc or click again to stop.'
  } else {
    inspectBtn.textContent = 'Inspect Font'
    inspectBtn.classList.remove('active')
    hint.textContent =
      'Click to start, then hover any element. A tooltip appears on the page; ' +
      'the last reading is also saved here.'
  }
}

/* -------------------------------------------------------------------------- */
/*  On open: restore the last reading + inspecting state                      */
/* -------------------------------------------------------------------------- */

chrome.storage.local.get(['lastFontInfo', 'inspecting'], (res) => {
  if (res.lastFontInfo) render(res.lastFontInfo)
  setInspectingUI(Boolean(res.inspecting))
})

/* -------------------------------------------------------------------------- */
/*  Toggle inspection (inject content script)                                 */
/* -------------------------------------------------------------------------- */

inspectBtn.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    })

    if (!tab?.id) {
      hint.textContent = 'No active tab found.'
      return
    }

    const url = tab.url || ''
    if (
      url.startsWith('chrome://') ||
      url.startsWith('edge://') ||
      url.startsWith('about:') ||
      url.startsWith('https://chromewebstore.google.com')
    ) {
      hint.textContent =
        'This page is protected by the browser and cannot be inspected.'
      return
    }

    // Re-injecting toggles the content script (start <-> stop).
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    })

    // Optimistically flip the UI; the storage listener will keep it in sync.
    const nowActive = !inspectBtn.classList.contains('active')
    setInspectingUI(nowActive)
  } catch (err) {
    console.error(err)
    hint.textContent = 'Could not inject the inspector: ' + err.message
  }
})

/* -------------------------------------------------------------------------- */
/*  Live updates while the popup is open                                       */
/* -------------------------------------------------------------------------- */

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'FONT_INFO') render(message.payload)
})

// Keep the button state in sync if inspecting is toggled (e.g. Esc on page).
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return
  if (changes.inspecting) setInspectingUI(Boolean(changes.inspecting.newValue))
  if (changes.lastFontInfo?.newValue) render(changes.lastFontInfo.newValue)
})
