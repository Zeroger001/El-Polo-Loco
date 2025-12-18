/**
 * Provides UI elements for mobile rotation handling.
 */

let rotateOverlay = null;

/**
 * Creates the rotate overlay if it does not yet exist.
 * @returns {HTMLElement}
 */
function createRotateOverlay() {
  if (rotateOverlay) return rotateOverlay;

  const div = document.createElement("div");
  div.id = "rotateOverlay";
  applyRotateOverlayStyle(div);
  appendRotateOverlayContent(div);

  document.body.appendChild(div);
  rotateOverlay = div;
  return div;
}

/**
 * Applies base styles to the rotate overlay.
 * @param {HTMLElement} el
 */
function applyRotateOverlayStyle(el) {
  Object.assign(el.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(0,0,0,0.9)",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    color: "#fff",
    fontSize: "1.5em",
    zIndex: "9999",
    opacity: "0",
    transition: "opacity 0.4s ease"
  });
}

/**
 * Appends message and button to the overlay.
 * @param {HTMLElement} el
 */
function appendRotateOverlayContent(el) {
  const msg = document.createElement("div");
  msg.textContent = "📱 Please rotate your device to landscape";
  msg.style.textAlign = "center";
  msg.style.padding = "0 20px";

  el.appendChild(msg);
}

/**
 * Shows the rotate overlay.
 */
function showRotateOverlay() {
  const el = createRotateOverlay();
  el.style.display = "flex";
  void el.offsetWidth;
  el.style.opacity = "1";
}

/**
 * Hides the rotate overlay.
 */
function hideRotateOverlay() {
  if (!rotateOverlay) return;
  rotateOverlay.style.opacity = "0";
  setTimeout(() => {
    if (rotateOverlay) rotateOverlay.style.display = "none";
  }, 400);
}
