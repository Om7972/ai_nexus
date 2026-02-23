/**
 * PageTransition.jsx
 *
 * Wrap any page component to get a smooth Framer Motion entry/exit.
 * Uses AnimatePresence in Routes.jsx to trigger exit when navigating away.
 *
 * Usage in Routes.jsx:
 *   import PageTransition from '../components/PageTransition';
 *   // wrap each <Route element={...}> child with <PageTransition>
 *
 * Or use directly in any page component:
 *   export default function MyPage() {
 *     return (
 *       <PageTransition>
 *         <div>…</div>
 *       </PageTransition>
 *     );
 *   }
 */

import React from 'react';
import { motion } from 'framer-motion';

const variants = {
    initial: { opacity: 0, y: 14 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.30, ease: [0.4, 0, 0.2, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] } },
};

function PageTransition({ children, className = '' }) {
    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate="enter"
            exit="exit"
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default PageTransition;
