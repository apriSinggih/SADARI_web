import { useEffect } from 'react'

export default function NotificationModal({
  isOpen,
  title,
  message,
  type = 'info',
  onClose,
  confirmText = 'Mengerti'
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getIcon = () => {
    if (type === 'reset' || type === 'sadari') return '🌸'
    if (type === 'success') return '✅'
    if (type === 'error') return '⚠️'
    return 'ℹ️'
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(74, 21, 37, 0.35)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      animation: 'fadeIn 0.2s ease',
      padding: '20px'
    }}>
      <div className="card" style={{
        maxWidth: 440,
        width: '100%',
        textAlign: 'center',
        padding: '32px 24px',
        borderRadius: 24,
        background: '#FFFFFF',
        border: '1.5px solid rgba(232, 122, 144, 0.3)',
        boxShadow: '0 20px 50px -10px rgba(232, 122, 144, 0.35), 0 8px 24px rgba(74, 21, 37, 0.1)',
        animation: 'popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'var(--pink-primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          margin: '0 auto 16px',
          boxShadow: '0 4px 14px rgba(232, 122, 144, 0.2)'
        }}>
          {getIcon()}
        </div>

        <h3 style={{ fontSize: '1.35rem', color: 'var(--text-heading)', marginBottom: 10 }}>
          {title || 'Pemberitahuan'}
        </h3>

        <p style={{ fontSize: '0.98rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 24 }}>
          {message}
        </p>

        <div>
          <button
            className="btn btn-primary"
            onClick={onClose}
            style={{ width: '100%', padding: '12px 24px', fontSize: '1rem' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
