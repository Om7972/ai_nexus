import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  const isAuthPage = location?.pathname === '/user-login' || location?.pathname === '/user-registration';

  const navigationItems = [
    { name: 'Dashboard', path: '/main-dashboard', icon: 'LayoutDashboard' },
    { name: 'Text Studio', path: '/ai-text-generation-studio', icon: 'FileText' },
    { name: 'Image Lab', path: '/ai-image-processing-lab', icon: 'Image' },
    { name: 'Data Workspace', path: '/ai-data-analysis-workspace', icon: 'BarChart3' },
  ];

  const moreItems = [
    { name: 'Settings', path: '/settings', icon: 'Settings' },
    { name: 'Help', path: '/help', icon: 'HelpCircle' },
    { name: 'Admin', path: '/admin', icon: 'Shield' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  if (isAuthPage) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-border">
        <div className="flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={20} color="var(--color-primary)" />
            </div>
            <span className="text-xl font-semibold text-primary-foreground">AI Nexus</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              to={location?.pathname === '/user-login' ? '/user-registration' : '/user-login'}
              className="text-sm text-primary-foreground/80 hover:text-primary-foreground spring-animation"
            >
              {location?.pathname === '/user-login' ? 'Sign Up' : 'Sign In'}
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-morphism border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        <Link to="/main-dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
            <Icon name="Zap" size={20} color="var(--color-primary)" />
          </div>
          <span className="text-xl font-semibold text-foreground">AI Nexus</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium spring-animation ${
                location?.pathname === item?.path
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon name={item?.icon} size={16} />
              <span>{item?.name}</span>
            </Link>
          ))}
          
          {/* More Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              iconName="MoreHorizontal"
              iconSize={16}
            >
              More
            </Button>
            
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 glass-morphism rounded-lg elevation-2 py-2">
                {moreItems?.map((item) => (
                  <Link
                    key={item?.path}
                    to={item?.path}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground spring-animation"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon name={item?.icon} size={16} />
                    <span>{item?.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <Button variant="ghost" size="sm" iconName="Search" iconSize={16} className="hidden md:flex">
            Search
          </Button>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" iconName="Bell" iconSize={16} />
          
          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleUserMenu}
              className="flex items-center space-x-2"
            >
              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                <Icon name="User" size={14} color="var(--color-primary)" />
              </div>
              <span className="hidden md:inline text-sm">John Doe</span>
              <Icon name="ChevronDown" size={14} />
            </Button>
            
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 glass-morphism rounded-lg elevation-2 py-2">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground">John Doe</p>
                  <p className="text-xs text-muted-foreground">john@example.com</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground spring-animation"
                >
                  <Icon name="User" size={16} />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground spring-animation"
                >
                  <Icon name="Settings" size={16} />
                  <span>Settings</span>
                </Link>
                <button
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground spring-animation"
                  onClick={() => {
                    // Handle logout
                    setIsUserMenuOpen(false);
                  }}
                >
                  <Icon name="LogOut" size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="lg:hidden"
            iconName={isMenuOpen ? "X" : "Menu"}
            iconSize={20}
          />
        </div>
      </div>
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden glass-morphism border-t border-border">
          <nav className="px-6 py-4 space-y-2">
            {navigationItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium spring-animation ${
                  location?.pathname === item?.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon name={item?.icon} size={18} />
                <span>{item?.name}</span>
              </Link>
            ))}
            
            <div className="border-t border-border pt-2 mt-4">
              {moreItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm text-foreground hover:bg-accent hover:text-accent-foreground spring-animation"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon name={item?.icon} size={18} />
                  <span>{item?.name}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;