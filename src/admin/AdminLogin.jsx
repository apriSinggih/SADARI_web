import { useState } from 'react'

export default function AdminLogin({ onAuth }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const expected = import.meta.env.VITE_ADMIN_PASSWORD
    if (!expected) {
      setError('Admin password belum dikonfigurasi (VITE_ADMIN_PASSWORD).')
      return
    }
    if (password === expected) {
      localStorage.setItem('admin_authenticated', '1')
      onAuth()
    } else {
      setError('Password salah')
    }
  }

  return (
    <div className="card container" style={{ maxWidth: 440, margin: '60px auto 0', padding: '36px 28px', textAlign: 'center' }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'var(--pink-primary-light)',
        color: 'var(--pink-primary-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.6rem',
        margin: '0 auto 16px'
      }}>
        🔐
      </div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Admin Login</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
        Masukan kata sandi untuk mengakses dashboard admin.
      </p>

      <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
        <div className="form-group">
          <label>Password Admin</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: '12px' }}>
            Masuk ke Dashboard
          </button>
        </div>
        {error && (
          <div className="badge danger" style={{ marginTop: 16, width: '100%', justifyContent: 'center', padding: '10px' }}>
            ⚠️ {error}
          </div>
        )}
      </form>
    </div>
  )
}
