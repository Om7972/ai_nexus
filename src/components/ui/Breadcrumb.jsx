import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/cn';

const Breadcrumb = () => {
    const location = useLocation();
    const paths = location.pathname.split('/').filter(Boolean);

    if (paths.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className="mb-4 flex">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                <li>
                    <Link to="/main-dashboard" className="flex items-center hover:text-foreground transition-colors">
                        <Home className="w-4 h-4" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>
                {paths.map((path, index) => {
                    const isLast = index === paths.length - 1;
                    const href = `/${paths.slice(0, index + 1).join('/')}`;

                    const label = path
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());

                    return (
                        <li key={path} className="flex items-center">
                            <ChevronRight className="w-4 h-4 text-muted-foreground/50 mx-1" />
                            {isLast ? (
                                <span className="font-medium text-foreground" aria-current="page">
                                    {label}
                                </span>
                            ) : (
                                <Link to={href} className="hover:text-foreground transition-colors">
                                    {label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
