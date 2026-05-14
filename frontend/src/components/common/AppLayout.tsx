import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useLogout } from '../../hooks/useAuth'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { ROUTES } from '../../constants/routes'

const NAV_ITEMS = [
  { to: ROUTES.TODOS, label: '할일' },
  { to: ROUTES.CATEGORIES, label: '카테고리' },
  { to: ROUTES.SETTINGS, label: '설정' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { mutate: logout } = useLogout()
  const { isDark, toggle } = useThemeStore()

  function handleLogout() {
    logout(undefined, { onSuccess: () => navigate(ROUTES.LOGIN) })
  }

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <span style={styles.logo}>TodoListApp</span>
        <div style={styles.headerRight}>
          <button onClick={toggle} style={styles.btnTheme}>{isDark ? '라이트' : '다크'}</button>
          <span style={styles.userName}>{user?.name}</span>
          <button onClick={handleLogout} style={styles.btnLogout}>로그아웃</button>
        </div>
      </header>

      <div style={styles.body}>
        <nav data-sidebar style={styles.sidebar}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main style={styles.main}>
          <Outlet />
        </main>
      </div>

      <nav data-bottom-bar style={styles.bottomBar}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              ...styles.tabItem,
              ...(isActive ? styles.tabItemActive : {}),
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  header: {
    height: 48,
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    flexShrink: 0,
  },
  logo: { fontSize: 16, fontWeight: 700, color: 'var(--accent)' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  btnTheme: {
    fontSize: 12,
    color: 'var(--text-secondary)',
    background: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    borderRadius: 4,
    padding: '3px 8px',
    cursor: 'pointer',
  },
  userName: { fontSize: 13, color: 'var(--text-secondary)' },
  btnLogout: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 4,
    padding: '4px 10px',
    cursor: 'pointer',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: 220,
    background: 'var(--bg-subtle)',
    borderRight: '1px solid var(--border)',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flexShrink: 0,
  },
  navItem: {
    display: 'block',
    padding: '8px 12px',
    borderRadius: 4,
    fontSize: 14,
    color: 'var(--text-primary)',
    textDecoration: 'none',
  },
  navItemActive: {
    background: 'var(--accent-light)',
    color: 'var(--accent)',
    fontWeight: 600,
  },
  main: { flex: 1, overflowY: 'auto', paddingBottom: 60 },
  bottomBar: {
    display: 'none',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    background: 'var(--bg-surface)',
    borderTop: '1px solid var(--border)',
    zIndex: 100,
  },
  tabItem: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
  },
  tabItemActive: {
    color: 'var(--accent)',
    fontWeight: 600,
  },
}
