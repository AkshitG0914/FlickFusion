import { useEffect } from 'react'

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      opacity: 0,
      animation: 'fadeIn 0.2s ease forwards',
    },
    modal: {
      backgroundColor: 'var(--card)',
      borderRadius: 'var(--radius)',
      padding: '1.5rem',
      width: '90%',
      maxWidth: '400px',
      position: 'relative',
      transform: 'translateY(20px)',
      animation: 'slideIn 0.2s ease forwards',
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: 'var(--foreground)',
      marginBottom: '1rem',
    },
    message: {
      fontSize: '1rem',
      color: 'var(--muted-foreground)',
      marginBottom: '1.5rem',
    },
    buttons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
    },
    cancelButton: {
      padding: '0.5rem 1rem',
      borderRadius: 'var(--radius)',
      backgroundColor: 'var(--card)',
      color: 'var(--muted-foreground)',
      border: '1px solid var(--border)',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
    },
    confirmButton: {
      padding: '0.5rem 1rem',
      borderRadius: 'var(--radius)',
      backgroundColor: 'var(--destructive)',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
    },
  }

  // Add animation styles
  const styleSheet = document.createElement('style')
  styleSheet.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .modal-cancel-button:hover {
      background-color: var(--accent);
      border-color: var(--border);
    }
    .modal-confirm-button:hover {
      opacity: 0.9;
    }
  `
  document.head.appendChild(styleSheet)

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.message}>{message}</p>
        <div style={styles.buttons}>
          <button
            style={styles.cancelButton}
            onClick={onClose}
            className="modal-cancel-button"
          >
            Cancel
          </button>
          <button
            style={styles.confirmButton}
            onClick={onConfirm}
            className="modal-confirm-button"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal 