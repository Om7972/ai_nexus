import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, LayoutDashboard, FileText, Image, BarChart3, Settings, User } from 'lucide-react';
import { cn } from '../utils/cn';

const PAGES = [
    { id: 'dashboard', title: 'Main Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, path: '/main-dashboard' },
    { id: 'text', title: 'Text Studio', icon: <FileText className="w-4 h-4" />, path: '/text-studio' },
    { id: 'image', title: 'Image Lab', icon: <Image className="w-4 h-4" />, path: '/ai-image-processing-lab' },
    { id: 'data', title: 'Data Workspace', icon: <BarChart3 className="w-4 h-4" />, path: '/data-workspace' },
    { id: 'profile', title: 'User Profile', icon: <User className="w-4 h-4" />, path: '/user-profile' },
    { id: 'settings', title: 'Settings', icon: <Settings className="w-4 h-4" />, path: '/user-settings' },
];

const CommandPalette = () => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const filteredPages = PAGES.filter((page) =>
        page.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (path) => {
        setOpen(false);
        navigate(path);
        setSearch('');
    };

    return (
        <>
            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                            onClick={() => setOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="relative w-full max-w-lg bg-card rounded-xl shadow-2xl border border-border overflow-hidden"
                        >
                            <div className="flex items-center px-4 border-b border-border">
                                <Search className="w-5 h-5 text-muted-foreground mr-2" />
                                <input
                                    autoFocus
                                    className="flex h-14 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
                                    placeholder="Type a command or search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <div className="flex items-center space-x-1 px-2 py-1 bg-muted rounded text-xs text-muted-foreground font-medium">
                                    <kbd>ESC</kbd>
                                </div>
                            </div>

                            <div className="max-h-[300px] overflow-y-auto p-2">
                                {filteredPages.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No results found.
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Suggestions
                                        </div>
                                        {filteredPages.map((page) => (
                                            <button
                                                key={page.id}
                                                onClick={() => handleSelect(page.path)}
                                                className="w-full flex items-center px-2 py-2 hover:bg-accent rounded-md text-sm text-foreground transition-colors outline-none focus:bg-accent"
                                            >
                                                <span className="mr-3 text-muted-foreground">
                                                    {page.icon}
                                                </span>
                                                {page.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CommandPalette;
