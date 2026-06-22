import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiPlus } from 'react-icons/fi';

const TeamSelector = ({ teams, selectedTeam, onSelectTeam, loading }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-400">Teams</h3>
        <button className="p-1 hover:bg-white/10 rounded transition-all">
          <FiPlus className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      <div className="space-y-2">
        {teams.map((team) => (
          <motion.button
            key={team._id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectTeam(team)}
            className={`w-full p-4 rounded-lg text-left transition-all ${
              selectedTeam?._id === team._id
                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50'
                : 'bg-white/5 hover:bg-white/10 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                {team.avatar ? (
                  <img src={team.avatar} alt={team.name} className="w-full h-full rounded-lg" />
                ) : (
                  <FiUsers className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{team.name}</p>
                <p className="text-xs text-gray-400">{team.members?.length || 0} members</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TeamSelector;
