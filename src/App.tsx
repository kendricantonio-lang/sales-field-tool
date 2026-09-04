import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { ContactsPage } from './pages/ContactsPage';
import { StoresPage } from './pages/StoresPage';
import { NotesPage } from './pages/NotesPage';
import { MapPage } from './pages/MapPage';

export default function App() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Sales Field Tool</h1>
        <button className="link-button" onClick={signOut}>
          Sign Out
        </button>
      </header>

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

      <nav className="bottom-nav">
        <NavLink to="/notes" className={({ isActive }) => (isActive ? 'active' : '')}>
          Notes
        </NavLink>
        <NavLink to="/contacts" className={({ isActive }) => (isActive ? 'active' : '')}>
          Contacts
        </NavLink>
        <NavLink to="/stores" className={({ isActive }) => (isActive ? 'active' : '')}>
          Stores
        </NavLink>
        <NavLink to="/map" className={({ isActive }) => (isActive ? 'active' : '')}>
          Map
        </NavLink>
      </nav>
    </div>
  );
}
