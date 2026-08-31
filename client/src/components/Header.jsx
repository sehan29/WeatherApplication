import { useAuth0 } from '@auth0/auth0-react'
import Brand from './Brand'

export default function Header({ theme, onToggleTheme }) {
  const { user, logout } = useAuth0()

  const initials = (user?.name || user?.email || 'U')
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  return (
    <header className="site-header">
      <Brand compact />
      <nav className="header-actions" aria-label="Account controls">
        <button className="icon-button theme-button" type="button" onClick={onToggleTheme}>
          <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
          <span className="visually-hidden">Use {theme === 'dark' ? 'light' : 'dark'} theme</span>
        </button>
        <div className="account-block">
          <span className="avatar" aria-hidden="true">{initials}</span>
          <span className="account-copy">
            <strong>{user?.name || 'Approved user'}</strong>
            <small>{user?.email}</small>
          </span>
        </div>
        <button
          className="text-button"
          type="button"
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        >
          Sign out
        </button>
      </nav>
    </header>
  )
}

