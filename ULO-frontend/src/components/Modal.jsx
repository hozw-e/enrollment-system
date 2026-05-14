import '../styles/modal.css';

/**
 * Confirmation Modal
 * @param {boolean} show - Whether to show the modal
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {function} onConfirm - Callback when confirmed
 * @param {function} onCancel - Callback when cancelled
 * @param {string} confirmText - Text for confirm button (default: "Confirm")
 * @param {string} cancelText - Text for cancel button (default: "Cancel")
 * @param {string} variant - "danger" | "warning" | "info" (default: "warning")
 */
export function ConfirmModal({ show, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'warning' }) {
  if (!show) return null;

  return (
    <div className="modalOverlayGlobal" onClick={onCancel}>
      <div className="modalGlobal" onClick={(e) => e.stopPropagation()}>
        <div className={`modalIconWrapper ${variant}`}>
          {variant === 'danger' && <span className="modalIcon">⚠</span>}
          {variant === 'warning' && <span className="modalIcon">⚠</span>}
          {variant === 'info' && <span className="modalIcon">ℹ</span>}
        </div>
        <h3 className="modalTitleGlobal">{title}</h3>
        <p className="modalMessage">{message}</p>
        <div className="modalActionsGlobal">
          <button className={`modalConfirmBtn ${variant}`} onClick={onConfirm}>{confirmText}</button>
          <button className="modalCancelBtn" onClick={onCancel}>{cancelText}</button>
        </div>
      </div>
    </div>
  );
}

/**
 * Alert/Error Modal
 * @param {boolean} show - Whether to show the modal
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {function} onClose - Callback when closed
 * @param {string} variant - "error" | "success" | "info" (default: "error")
 */
export function AlertModal({ show, title, message, onClose, variant = 'error' }) {
  if (!show) return null;

  return (
    <div className="modalOverlayGlobal" onClick={onClose}>
      <div className="modalGlobal" onClick={(e) => e.stopPropagation()}>
        <div className={`modalIconWrapper ${variant}`}>
          {variant === 'error' && <span className="modalIcon">✕</span>}
          {variant === 'success' && <span className="modalIcon">✓</span>}
          {variant === 'info' && <span className="modalIcon">ℹ</span>}
        </div>
        <h3 className="modalTitleGlobal">{title}</h3>
        <p className="modalMessage">{message}</p>
        <div className="modalActionsGlobal">
          <button className={`modalConfirmBtn ${variant}`} onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}
