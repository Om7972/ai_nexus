import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import Icon from '../AppIcon';
import Button from './Button';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/main-dashboard', icon: 'LayoutDashboard', description: 'Overview & metrics' },
  { name: 'Text Studio', path: '/text-studio', icon: 'FileText', description: 'Content generation' },
  { name: 'Image Lab', path: '/ai-image-processing-lab', icon: 'Image', description: 'Visual processing' },
  { name: 'Data Workspace', path: '/ai-data-analysis-workspace', icon: 'BarChart3', description: 'Analytics & insights' },
];

const RECENT = [
  { name: 'Marketing Copy', type: 'text', lastUsed: '2 hours ago' },
  { name: 'Product Images', type: 'image', lastUsed: '1 day ago' },
  { name: 'Sales Analysis', type: 'data', lastUsed: '3 days ago' },
];

const TYPE_ICON = { text: 'FileText', image: 'Image', data: 'BarChart3' };

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
  const { pathname } = useLocation();

  const isAuthPage = pathname === '/user-login' || pathname === '/user-registration';
  if (isAuthPage) return null;

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 bottom-0 z-40 glass border-r border-border',
        'flex flex-col',
        'transition-[width] duration-300 ease-spring',
        isCollapsed ? 'w-16' : 'w-64'
      )}
      aria-label="Sidebar navigation"
    >
      {/* ── Toggle ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-3 border-b border-border h-12 shrink-0">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
              className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pl-1"
            >
              Menu
            </motion.span>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleCollapse}
          iconName={isCollapsed ? 'ChevronRight' : 'ChevronLeft'}
          iconSize={15}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="ml-auto"
        />
      </div>

      {/* ── Main nav ───────────────────────────────────────────────── */}
      <nav
        className="flex-1 p-2 space-y-0.5 overflow-y-auto"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                'spring-animation group overflow-hidden',
                active
                  ? 'nav-active'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {/* Active left bar */}
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-white/60 dark:bg-rose-taupe/60"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}

              <Icon
                name={item.icon}
                size={18}
                aria-hidden="true"
                className={cn('shrink-0', active && 'drop-shadow-sm')}
              />

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 min-w-0 overflow-hidden"
                  >
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-[11px] opacity-70 truncate">{item.description}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* ── Recent projects ────────────────────────────────────────── */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="p-3 border-t border-border"
          >
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
              Recent
            </p>
            <div className="space-y-0.5">
              {RECENT.map((p, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-foreground hover:bg-accent spring-animation text-left"
                >
                  <Icon name={TYPE_ICON[p.type] || 'File'} size={14} aria-hidden="true" className="text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-xs">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground">{p.lastUsed}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick actions ──────────────────────────────────────────── */}
      <div className={cn('p-3 border-t border-border', isCollapsed && 'px-2')}>
        {isCollapsed ? (
          <div className="space-y-1.5">
            <Button variant="ghost" size="icon-sm" iconName="Plus" iconSize={14} title="New Project" fullWidth />
            <Button variant="ghost" size="icon-sm" iconName="Upload" iconSize={14} title="Upload Files" fullWidth />
          </div>
        ) : (
          <div className="space-y-1.5">
            <Button variant="outline" size="sm" iconName="Plus" iconPosition="left" fullWidth>New Project</Button>
            <Button variant="ghost" size="sm" iconName="Upload" iconPosition="left" fullWidth>Upload Files</Button>
          </div>
        )}
      </div>

      {/* ── API usage meter ────────────────────────────────────────── */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="p-4 border-t border-border"
          >
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-muted-foreground">API Usage</span>
              <span className="text-foreground font-semibold">75%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={75}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="API usage 75%"
              className="w-full h-1.5 rounded-full bg-muted overflow-hidden"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="h-full rounded-full bg-primary"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">7,500 / 10,000 this month</p>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};

export default Sidebar;