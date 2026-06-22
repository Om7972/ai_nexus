import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchTeams,
  fetchProjects,
  fetchDocuments,
  setSelectedTeam,
  setSelectedProject,
  setCurrentDocument,
} from '../store/slices/collaborationSlice';
import TeamSelector from '../components/collaboration/TeamSelector';
import ProjectList from '../components/collaboration/ProjectList';
import DocumentEditor from '../components/collaboration/DocumentEditor';
import ActivityFeed from '../components/collaboration/ActivityFeed';
import Sidebar from '../components/Sidebar';
import Navigation from '../components/Navigation';
import {
  FiUsers,
  FiFolderPlus,
  FiFilePlus,
  FiActivity,
  FiSettings,
} from 'react-icons/fi';

const Collaboration = () => {
  const dispatch = useDispatch();
  const [showSidebar, setShowSidebar] = useState(true);
  const [showActivityFeed, setShowActivityFeed] = useState(true);
  const [activeView, setActiveView] = useState('documents'); // documents, projects, teams

  const {
    teams,
    selectedTeam,
    projects,
    selectedProject,
    documents,
    currentDocument,
    teamsLoading,
    projectsLoading,
  } = useSelector((state) => state.collaboration);

  // Fetch teams on mount
  useEffect(() => {
    dispatch(fetchTeams({ page: 1, limit: 20 }));
  }, [dispatch]);

  // Fetch projects when team is selected
  useEffect(() => {
    if (selectedTeam) {
      dispatch(fetchProjects({ team: selectedTeam._id, page: 1, limit: 20 }));
    }
  }, [selectedTeam, dispatch]);

  // Fetch documents when project is selected
  useEffect(() => {
    if (selectedProject) {
      dispatch(fetchDocuments({ project: selectedProject._id, page: 1, limit: 20 }));
    }
  }, [selectedProject, dispatch]);

  const handleTeamSelect = (team) => {
    dispatch(setSelectedTeam(team));
    dispatch(setSelectedProject(null));
    dispatch(setCurrentDocument(null));
  };

  const handleProjectSelect = (project) => {
    dispatch(setSelectedProject(project));
    dispatch(setCurrentDocument(null));
  };

  const handleDocumentSelect = (document) => {
    dispatch(setCurrentDocument(document));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Navigation />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-20"
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Teams/Projects/Documents */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Collaboration</h1>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                  <FiSettings className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* View Tabs */}
              <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg">
                <button
                  onClick={() => setActiveView('teams')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                    activeView === 'teams'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FiUsers className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setActiveView('projects')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                    activeView === 'projects'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FiFolderPlus className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setActiveView('documents')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                    activeView === 'documents'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FiFilePlus className="w-4 h-4 mx-auto" />
                </button>
              </div>

              {/* Team Selector */}
              <TeamSelector
                teams={teams}
                selectedTeam={selectedTeam}
                onSelectTeam={handleTeamSelect}
                loading={teamsLoading}
              />

              {/* Projects List */}
              {selectedTeam && activeView !== 'teams' && (
                <div className="mt-6">
                  <ProjectList
                    projects={projects}
                    selectedProject={selectedProject}
                    onSelectProject={handleProjectSelect}
                    loading={projectsLoading}
                  />
                </div>
              )}

              {/* Documents List */}
              {selectedProject && activeView === 'documents' && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Documents</h3>
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <motion.button
                        key={doc._id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDocumentSelect(doc)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          currentDocument?._id === doc._id
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50'
                            : 'bg-white/5 hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FiFilePlus className="w-4 h-4 text-blue-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {doc.title}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(doc.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Center Panel - Document Editor */}
          <div className="flex-1 overflow-hidden">
            {currentDocument ? (
              <DocumentEditor document={currentDocument} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FiFilePlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    No Document Selected
                  </h3>
                  <p className="text-gray-500">
                    Select a document from the left panel to start collaborating
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Activity Feed */}
          <AnimatePresence>
            {showActivityFeed && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="w-80 bg-white/5 backdrop-blur-xl border-l border-white/10 overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <FiActivity className="w-5 h-5 text-blue-400" />
                      <h2 className="text-lg font-semibold text-white">Activity</h2>
                    </div>
                    <button
                      onClick={() => setShowActivityFeed(false)}
                      className="p-1 hover:bg-white/10 rounded transition-all"
                    >
                      <span className="text-gray-400">✕</span>
                    </button>
                  </div>
                  <ActivityFeed />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Action Button - Toggle Activity Feed */}
      {!showActivityFeed && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowActivityFeed(true)}
          className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <FiActivity className="w-6 h-6 text-white" />
        </motion.button>
      )}
    </div>
  );
};

export default Collaboration;
