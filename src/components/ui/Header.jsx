import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, Menu, X, ChevronDown, Sun, Moon, Globe
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { logoutUser } from '../../store/slices/authSlice';
import { fetchNotifications } from '../../store/slices/notificationSlice';
import { performSearch, getSearchSuggestions, setQuery } from '../../store/slices/searchSlice';
import { useTheme } from '../../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import SearchDropdown from './SearchDropdown';
import UserProfileDropdown from './UserProfileDropdown';

// ── Nav link with active indicator ───────────────────────────────────────────
function NavLink({ to, children, onClick }) {
  const { pathname } = useLocation();
  const active = pathname.startsWith(to);
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'relative px-3 py-2 rounded-md text-sm font-medium spring-animation',
        active
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      )}
      aria-current={active ? 'page' : undefined}
    >
      {children}
      {active && (
        <motion.span
          layoutId="header-active-pill"
          className="absolute inset-x-1 -bottom-0.5 h-0.5 rounded-full bg-primary"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, isAuthenticated } = useSelector(s => s.auth);
  const { unreadCount } = useSelector(s => s.notifications);
  const { query, suggestions, loading: searchLoading } = useSelector(s => s.search);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchNotifications());
  }, [dispatch, isAuthenticated]);

  // Close all dropdowns on outside click
  useEffect(() => {
    const close = () => {
      setIsNotificationOpen(false);
      setIsProfileOpen(false);
      setIsSearchOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/user-login');
  };

  const handleSearch = (q) => {
    if (q.trim()) {
      dispatch(performSearch({ query: q }));
      setIsSearchOpen(false);
    }
  };

  const handleSearchChange = (v) => {
    dispatch(setQuery(v));
    if (v.length > 2) dispatch(getSearchSuggestions(v));
  };

  const navLinks = [
    { to: '/main-dashboard', label: 'Dashboard' },
    { to: '/ai-data-analysis-workspace', label: 'Data Analysis' },
    { to: '/ai-image-processing-lab', label: 'Image Lab' },
    { to: '/text-studio', label: 'Text Studio' },
  ];

  return (
    <header
      className="glass border-b border-border sticky top-0 z-50"
      role="banner"
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── Logo ───────────────────────────────────────────────── */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 focus-ring rounded-lg"
            aria-label="AI Nexus home"
          >
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs tracking-tight">AI</span>
            </div>
            <span className="text-lg font-semibold text-foreground hidden sm:block tracking-tight">
              AI Nexus
            </span>
          </Link>

          {/* ── Desktop nav ────────────────────────────────────────── */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
            ))}
          </nav>

          {/* ── Search bar ─────────────────────────────────────────── */}
          <div
            className="hidden md:flex flex-1 max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative w-full">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                role="searchbox"
                aria-label="Search projects, models, users"
                placeholder="Search…"
                value={query}
                onChange={e => handleSearchChange(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                className={cn(
                  "input-base pl-9 pr-3 text-sm bg-background/80",
                  "placeholder:text-muted-foreground/70"
                )}
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div
                    className="h-3.5 w-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin"
                    aria-label="Searching…"
                  />
                </div>
              )}
              <AnimatePresence>
                {isSearchOpen && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <SearchDropdown
                      suggestions={suggestions}
                      onSelect={handleSearch}
                      onClose={() => setIsSearchOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Right actions ──────────────────────────────────────── */}
          <div className="flex items-center gap-1">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent micro-interaction focus-ring"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDark ? 'sun' : 'moon'}
                  initial={{ rotate: -30, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 30, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="block"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </motion.span>
              </AnimatePresence>
            </button>

            {/* Language (placeholder) */}
            <button
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent micro-interaction focus-ring"
              aria-label="Select language"
            >
              <Globe size={18} />
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div
                  className="relative"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => setIsNotificationOpen(v => !v)}
                    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                    aria-expanded={isNotificationOpen}
                    aria-haspopup="true"
                    className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent micro-interaction focus-ring"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
                        aria-hidden="true"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </button>
                  <AnimatePresence>
                    {isNotificationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                      >
                        <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User profile */}
                <div
                  className="relative"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => setIsProfileOpen(v => !v)}
                    aria-label="User menu"
                    aria-expanded={isProfileOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-accent micro-interaction focus-ring"
                  >
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-sm shrink-0">
                      {user?.avatar
                        ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" aria-hidden="true" />
                        : <span className="text-white text-sm font-semibold" aria-hidden="true">
                          {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </span>
                      }
                    </div>
                    <ChevronDown
                      size={14}
                      className={cn(
                        "text-muted-foreground hidden sm:block spring-animation",
                        isProfileOpen && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                      >
                        <UserProfileDropdown
                          user={user}
                          onClose={() => setIsProfileOpen(false)}
                          onLogout={handleLogout}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/user-login"
                  className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground spring-animation focus-ring rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  to="/user-registration"
                  className="px-3 py-1.5 text-sm font-medium rounded-md gradient-primary text-white shadow-sm hover:brightness-110 spring-animation focus-ring"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(v => !v)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent micro-interaction focus-ring"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isMobileMenuOpen ? 'close' : 'open'}
                  initial={{ rotate: -30, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 30, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="md:hidden overflow-hidden border-t border-border"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(l => (
                <NavLink key={l.to} to={l.to} onClick={() => setIsMobileMenuOpen(false)}>
                  {l.label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;