/**
 * Shows a modal element.
 * @param {HTMLElement} modal
 */
function showModal(modal) {
    modal.classList.remove("hidden");
    modal.classList.add("show");
}

/**
 * Hides a modal element.
 * @param {HTMLElement} modal
 */
function hideModal(modal) {
    modal.classList.add("hidden");
    modal.classList.remove("show");
}

/**
 * Binds open and close buttons for a modal.
 * @param {HTMLElement} modal
 * @param {HTMLElement} openBtn
 * @param {HTMLElement} closeBtn
 */
function bindModal(modal, openBtn, closeBtn) {
    openBtn.addEventListener("click", () => showModal(modal));
    closeBtn.addEventListener("click", () => hideModal(modal));
}

/**
 * Handles closing modals when clicking outside.
 * @param {HTMLElement[]} modals
 */
function bindOutsideClose(modals) {
    window.addEventListener("click", e => {
        modals.forEach(m => {
            if (e.target === m) hideModal(m);
        });
    });
}

const controllModal = document.getElementById("controlling-modal");
const instructionModal = document.getElementById("instructions-modal");
const impressumModal = document.getElementById("impressum-modal");

bindModal(
    controllModal,
    document.getElementById("controlling-btn"),
    document.getElementById("close-modal")
);

bindModal(
    instructionModal,
    document.getElementById("instructions-btn"),
    document.getElementById("close-modal2")
);

bindModal(
    impressumModal,
    document.getElementById("impressum-btn"),
    document.getElementById("close-modal3")
);

bindOutsideClose([controllModal, instructionModal, impressumModal]);
