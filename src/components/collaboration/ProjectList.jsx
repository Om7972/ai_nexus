import React from 'react';
import { motion } from 'framer-motion';
import { FiFolderPlus, FiPlus } from 'react-icons/fi';

const ProjectList = ({ projects, selectedProject, onSelectProject, loading }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-400">Projects</h3>
        <button className="p-1 hover:bg-white/10 rounded transition-all">
          <FiPlus className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      <div className="space-y-2">
        {projects.map((project) => (
          <motion.button
            key={project._id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectProject(project)}
            className={`w-full p-3 rounded-lg text-left transition-all ${
              selectedProject?._id === project._id
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50'
                : 'bg-white/5 hover:bg-white/10 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <FiFolderPlus className="w-4 h-4 text-purple-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{project.name}</p>
                <p className="text-xs text-gray-400 capitalize">{project.status}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
