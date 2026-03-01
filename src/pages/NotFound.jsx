import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, SearchX } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg text-center relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
          className="w-24 h-24 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-inner"
        >
          <SearchX className="w-12 h-12 text-primary drop-shadow-sm" />
        </motion.div>

        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-focus tracking-tighter mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold text-foreground tracking-tight mb-3">
          Page Not Found
        </h2>
        <p className="text-muted-foreground text-lg mb-10 leading-relaxed font-medium">
          The module or resource you are looking for has been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto min-w-[160px] font-semibold"
            onClick={() => window.history?.back()}
            icon={<ArrowLeft className="w-5 h-5 mr-2" />}
            iconPosition="left"
          >
            Go Back
          </Button>

          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto min-w-[160px] font-semibold"
            onClick={() => navigate('/main-dashboard')}
            icon={<Home className="w-5 h-5 mr-2" />}
            iconPosition="left"
          >
            Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
