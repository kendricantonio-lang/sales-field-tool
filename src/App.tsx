import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { ContactsPage } from './pages/ContactsPage';
import { StoresPage } from './pages/StoresPage';
import { NotesPage } from './pages/NotesPage';
import { MapPage } from './pages/MapPage';

const NAV_LINKS = [
  { to: '/notes', label: 'Notes' },
  { to: '/contacts', label: 'Contacts' },
  { to: '/stores', label: 'Stores' },
  { to: '/map', label: 'Map' },
];

export default function App() {
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <button
          className="hamburger-button"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
        <h1>Sales Field Tool</h1>
        <button className="link-button" onClick={signOut}>
          Sign Out
        </button>
      </header>

      {menuOpen && (
        <div className="side-menu-backdrop" onClick={() => setMenuOpen(false)}>
          <nav className="side-menu" onClick={(e) => e.stopPropagation()}>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/notes" replace />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="*" element={<Navigate to="/notes" replace />} />
        </Routes>
      </main>
    </div>
  );
}
