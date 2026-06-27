import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  MessageSquare,
  Library,
  FileText,
  FilePlus,
  Compass,
  ArrowRight,
  Upload,
  Globe,
  Youtube,
  Trash2,
  FileCode,
  CheckCircle,
  Copy,
  FolderOpen,
  ChevronRight,
  TrendingUp,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  Download,
  FolderPlus,
  RefreshCw,
  Plus
} from 'lucide-react';
import Layout from '../components/Layout';
import { useToast } from '../context/ThemeContext';

import { API_BASE_URL } from '../utils/api';

const API_URL = API_BASE_URL;

const ResearchCopilot = () => {
  const toast = useToast().toast;

  // Tabs: dashboard | chat | sources | citations | notes | mindmap
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data States
  const [sessions, setSessions] = useState([]);
  const [sources, setSources] = useState([]);
  const [notes, setNotes] = useState([]);
  const [citations, setCitations] = useState([]);
  
  // Active/Selected States
  const [activeSession, setActiveSession] = useState(null);
  const [selectedSources, setSelectedSources] = useState([]);
  const [activeSourceDetails, setActiveSourceDetails] = useState(null);
  const [activeNote, setActiveNote] = useState(null);

  // Form States
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadType, setUploadType] = useState('url'); // url | file
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadContradictions, setUploadContradictions] = useState([]);

  // Citations
  const [citationForm, setCitationForm] = useState({
    title: '',
    authors: '',
    publisher: '',
    publishYear: '',
    url: ''
  });
  const [citationLoading, setCitationLoading] = useState(false);
  const [selectedCitationFormat, setSelectedCitationFormat] = useState('apa'); // apa | mla | chicago | ieee

  // Notes
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteFolder, setNoteFolder] = useState('General');
  const [noteTags, setNoteTags] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);

  // Mindmap View State
  const [mindmapData, setMindmapData] = useState(null);
  const [mindmapLoading, setMindmapLoading] = useState(false);
  const [mindmapTargetType, setMindmapTargetType] = useState('source'); // source | note | text
  const [mindmapTargetId, setMindmapTargetId] = useState('');
  const [mindmapCustomText, setMindmapCustomText] = useState('');
  const [selectedMindmapNode, setSelectedMindmapNode] = useState(null);

  // Scroll ref for chat
  const chatEndRef = useRef(null);

  // Fetch History on Mount
  const fetchHistory = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
      const res = await axios.get(`${API_URL}/research/history`, { headers });
      if (res.data?.success) {
        const { sessions, sources, notes, citations } = res.data.data;
        setSessions(sessions);
        setSources(sources);
        setNotes(notes);
        setCitations(citations);

        // Set default selection
        if (sessions.length > 0 && !activeSession) {
          setActiveSession(sessions[0]);
        }
        if (notes.length > 0 && !activeNote) {
          setActiveNote(notes[0]);
          setNoteTitle(notes[0].title);
          setNoteContent(notes[0].content);
          setNoteFolder(notes[0].folder || 'General');
          setNoteTags(notes[0].tags ? notes[0].tags.join(', ') : '');
        }
      }
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Failed to load research history.');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession?.messages]);

  // Start New Chat Session
  const startNewSession = () => {
    setActiveSession({
      _id: null,
      title: 'New Chat Workspace',
      messages: [],
      activeSources: []
    });
    setSelectedSources([]);
    setActiveTab('chat');
  };

  // Chat Execution
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatMessage('');
    setChatLoading(true);

    // Optimistically update UI
    const optimisticMessage = { role: 'user', content: userMsg, timestamp: new Date() };
    const updatedMessages = activeSession ? [...activeSession.messages, optimisticMessage] : [optimisticMessage];
    
    setActiveSession(prev => ({
      ...prev,
      messages: updatedMessages
    }));

    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
      const res = await axios.post(`${API_URL}/research/chat`, {
        sessionId: activeSession?._id || undefined,
        message: userMsg,
        activeSourceIds: selectedSources
      }, { headers });

      if (res.data?.success) {
        const reply = res.data.data.message;
        const sId = res.data.data.sessionId;

        setActiveSession(prev => ({
          ...prev,
          _id: sId,
          messages: [...updatedMessages, reply]
        }));

        fetchHistory();
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Could not get response from Research Copilot.');
    } finally {
      setChatLoading(false);
    }
  };

  // Source Upload Handler
  const handleUploadSource = async (e) => {
    e.preventDefault();
    setUploadLoading(true);
    setUploadContradictions([]);

    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
      let res;

      if (uploadType === 'url') {
        if (!uploadUrl) {
          toast.error('Please enter a valid URL.');
          setUploadLoading(false);
          return;
        }
        res = await axios.post(`${API_URL}/research/upload`, {
          url: uploadUrl,
          type: 'url',
          sessionId: activeSession?._id || undefined
        }, { headers });
      } else {
        if (!selectedFile) {
          toast.error('Please select a file to upload.');
          setUploadLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (activeSession?._id) {
          formData.append('sessionId', activeSession._id);
        }
        formData.append('type', 'file');

        res = await axios.post(`${API_URL}/research/upload`, formData, {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      if (res.data?.success) {
        const sourceData = res.data.data.source;
        toast.success(`Successfully uploaded source: ${sourceData.title}`);
        
        if (res.data.data.contradictions?.length > 0) {
          setUploadContradictions(res.data.data.contradictions);
        }

        setUploadUrl('');
        setSelectedFile(null);
        setActiveSourceDetails(sourceData);
        fetchHistory();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Error processing document source.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Generate Synthesized Note
  const handleGenerateNotes = async () => {
    if (selectedSources.length === 0) {
      toast.error('Select at least one active source to synthesize notes.');
      return;
    }
    setNotesLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
      const res = await axios.post(`${API_URL}/research/generate-notes`, {
        sourceIds: selectedSources,
        sessionId: activeSession?._id || undefined
      }, { headers });

      if (res.data?.success) {
        toast.success('Structured notes generated successfully!');
        const note = res.data.data;
        setActiveNote(note);
        setNoteTitle(note.title);
        setNoteContent(note.content);
        setNoteFolder(note.folder);
        setNoteTags(note.tags ? note.tags.join(', ') : '');
        setActiveTab('notes');
        fetchHistory();
      }
    } catch (error) {
      console.error('Notes generation error:', error);
      toast.error('Failed to auto-generate notes.');
    } finally {
      setNotesLoading(false);
    }
  };

  // Generate Citation
  const handleCreateCitation = async (e) => {
    e.preventDefault();
    setCitationLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
      const res = await axios.post(`${API_URL}/research/generate-citations`, {
        sessionId: activeSession?._id || undefined,
        title: citationForm.title,
        authors: citationForm.authors.split(',').map(x => x.trim()),
        publisher: citationForm.publisher,
        publishYear: citationForm.publishYear,
        url: citationForm.url
      }, { headers });

      if (res.data?.success) {
        toast.success('Citation compiled successfully.');
        setCitationForm({ title: '', authors: '', publisher: '', publishYear: '', url: '' });
        fetchHistory();
      }
    } catch (error) {
      console.error('Citation creation error:', error);
      toast.error('Failed to compile bibliography reference.');
    } finally {
      setCitationLoading(false);
    }
  };

  // Extract Mindmap
  const handleCreateMindMap = async () => {
    setMindmapLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}` };
      const res = await axios.post(`${API_URL}/research/create-mindmap`, {
        sourceId: mindmapTargetType === 'source' ? mindmapTargetId : undefined,
        noteId: mindmapTargetType === 'note' ? mindmapTargetId : undefined,
        text: mindmapTargetType === 'text' ? mindmapCustomText : undefined
      }, { headers });

      if (res.data?.success) {
        setMindmapData(res.data.data);
        setSelectedMindmapNode(res.data.data.nodes[0] || null);
        toast.success('Conceptual mind map generated!');
      }
    } catch (error) {
      console.error('Mindmap extraction error:', error);
      toast.error('Failed to construct concept map tree.');
    } finally {
      setMindmapLoading(false);
    }
  };

  // Helper Copy Citation
  const handleCopyCitation = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Citation copied to clipboard.');
  };

  // BibTeX Downloader
  const handleDownloadBibTeX = () => {
    try {
      const bibItems = citations.map((c, i) => {
        const key = `ref_${i + 1}`;
        const authorStr = c.authors?.join(' and ') || 'Unknown';
        return `@misc{${key},\n  author = {${authorStr}},\n  title = {${c.title}},\n  year = {${c.publishYear || '2026'}},\n  publisher = {${c.publisher || 'Web'}},\n  howpublished = {\\url{${c.url || ''}}}\n}`;
      }).join('\n\n');

      const blob = new Blob([bibItems], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'ai_nexus_citations.bib';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('BibTeX database downloaded.');
    } catch (e) {
      toast.error('Download failed.');
    }
  };

  // SVG coordinates solver for mind map nodes
  const calculateNodeCoords = (node, index, totalNodes) => {
    const cx = 350;
    const cy = 250;
    
    if (node.type === 'root') {
      return { x: cx, y: cy };
    }

    const radius = node.type === 'category' ? 140 : 230;
    const angle = (index * (2 * Math.PI)) / (totalNodes - 1);
    
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  };

  // Map nodes to layout coordinates
  let nodesWithCoords = [];
  let linksWithCoords = [];

  if (mindmapData && mindmapData.nodes) {
    const total = mindmapData.nodes.length;
    nodesWithCoords = mindmapData.nodes.map((n, i) => {
      const coords = calculateNodeCoords(n, i, total);
      return { ...n, ...coords };
    });

    linksWithCoords = (mindmapData.links || []).map(l => {
      const sourceNode = nodesWithCoords.find(n => n.id === l.source);
      const targetNode = nodesWithCoords.find(n => n.id === l.target);
      return {
        sourceX: sourceNode ? sourceNode.x : 0,
        sourceY: sourceNode ? sourceNode.y : 0,
        targetX: targetNode ? targetNode.x : 0,
        targetY: targetNode ? targetNode.y : 0
      };
    }).filter(l => l.sourceX !== 0);
  }

  // Active Source Selection Toggle
  const toggleSourceSelection = (id) => {
    if (selectedSources.includes(id)) {
      setSelectedSources(prev => prev.filter(x => x !== id));
    } else {
      setSelectedSources(prev => [...prev, id]);
    }
  };

  return (
    <Layout>
      <div className="space-y-8 pb-12">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-indigo-400" />
              AI Research Copilot
            </h1>
            <p className="text-gray-400 mt-1">
              Construct literature outlines, extract key data parameters, generate citations, and discover context correlations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={startNewSession}
              className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              New Research Space
            </button>
            <button
              onClick={fetchHistory}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
              title="Sync library"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Tab selection grid */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 max-w-3xl overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Compass },
            { id: 'chat', label: 'Research Chat', icon: MessageSquare },
            { id: 'sources', label: 'Source Library', icon: Library },
            { id: 'citations', label: 'Citation Manager', icon: FileCode },
            { id: 'notes', label: 'Notes Workspace', icon: FileText },
            { id: 'mindmap', label: 'Mind Map', icon: TrendingUp }
          ].map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content rendering */}
        <AnimatePresence mode="wait">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Quick stats grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 rounded-xl p-5 border border-white/10 relative overflow-hidden">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Active Workspace</span>
                  <h3 className="text-3xl font-black text-white mt-2">{sessions.length}</h3>
                  <p className="text-xs text-gray-400 mt-1">Multi-session threads running</p>
                </div>
                <div className="bg-white/5 rounded-xl p-5 border border-white/10 relative overflow-hidden">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Indexed Materials</span>
                  <h3 className="text-3xl font-black text-white mt-2">{sources.length}</h3>
                  <p className="text-xs text-gray-400 mt-1">PDFs, Web pages, & YouTube channels</p>
                </div>
                <div className="bg-white/5 rounded-xl p-5 border border-white/10 relative overflow-hidden">
                  <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Saved Notes</span>
                  <h3 className="text-3xl font-black text-white mt-2">{notes.length}</h3>
                  <p className="text-xs text-gray-400 mt-1">Synthesized outline files</p>
                </div>
                <div className="bg-white/5 rounded-xl p-5 border border-white/10 relative overflow-hidden">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Bibliography References</span>
                  <h3 className="text-3xl font-black text-white mt-2">{citations.length}</h3>
                  <p className="text-xs text-gray-400 mt-1">APA, MLA, IEEE, Chicago listings</p>
                </div>
              </div>

              {/* Layout splits */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Session list / Threads */}
                <div className="lg:col-span-2 bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                    Recent Research Workspaces
                  </h3>
                  <div className="divide-y divide-white/5 space-y-2">
                    {sessions.length > 0 ? (
                      sessions.slice(0, 5).map(s => (
                        <div
                          key={s._id}
                          className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition-all group"
                        >
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white truncate max-w-[280px]">{s.title}</h4>
                            <span className="text-[10px] text-gray-500 block">
                              Last updated: {new Date(s.updatedAt).toLocaleDateString()} · {s.messages.length} messages
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setActiveSession(s);
                              setSelectedSources(s.activeSources || []);
                              setActiveTab('chat');
                            }}
                            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors"
                          >
                            Enter Workspace
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-xs text-gray-500">
                        No active workspace threads. Click "New Research Space" to begin.
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Panel / Guidelines */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    Research Capabilities
                  </h3>
                  <div className="space-y-3.5 text-xs text-gray-400 leading-relaxed">
                    <div className="flex gap-2">
                      <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span><strong>Url Scraping:</strong> Supply regular URLs to grab text content, title tags, and page authors instantly.</span>
                    </div>
                    <div className="flex gap-2">
                      <Youtube className="w-4 h-4 text-rose-400 shrink-0" />
                      <span><strong>Video Transcribing:</strong> Input YouTube links. The copilot fetches key outlines and auto-simulates the timestamps.</span>
                    </div>
                    <div className="flex gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                      <span><strong>Fallacy Finder:</strong> Uploaded materials are audited for logical contradictions and confidence scores.</span>
                    </div>
                    <div className="flex gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Concept Map:</strong> Visualize semantic relationships dynamically in a fully structured SVG node network.</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: RESEARCH CHAT */}
          {activeTab === 'chat' && (
            <motion.div
              key="chat-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              {/* Sidebar Sessions & Sources */}
              <div className="lg:col-span-1 space-y-6">
                {/* Active Sessions Panel */}
                <div className="bg-white/5 rounded-xl p-4.5 border border-white/10 space-y-4">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Sessions History</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {sessions.map(s => (
                      <button
                        key={s._id}
                        onClick={() => {
                          setActiveSession(s);
                          setSelectedSources(s.activeSources || []);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-all truncate block ${
                          activeSession?._id === s._id ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Link sources block */}
                <div className="bg-white/5 rounded-xl p-4.5 border border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Active Sources</h4>
                    <span className="text-[10px] text-gray-500 font-bold">Checked = RAG Context</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {sources.length > 0 ? (
                      sources.map(src => (
                        <div
                          key={src._id}
                          className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSources.includes(src._id)}
                            onChange={() => toggleSourceSelection(src._id)}
                            className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-transparent border-white/20"
                          />
                          <span className="text-xs text-gray-300 truncate font-semibold" title={src.title}>
                            {src.title}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] text-gray-500 py-4 text-center">No sources indexed yet. Add some in Source Library.</div>
                    )}
                  </div>
                  {selectedSources.length > 0 && (
                    <button
                      onClick={handleGenerateNotes}
                      disabled={notesLoading}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-[11px] font-bold text-white rounded uppercase tracking-wider transition-all flex justify-center items-center gap-1.5"
                    >
                      {notesLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      Auto Note Synth ({selectedSources.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Panel */}
              <div className="lg:col-span-3 bg-white/5 rounded-xl border border-white/10 flex flex-col h-[520px] overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {activeSession ? activeSession.title : 'New Chat Session'}
                      </h4>
                      <p className="text-[10px] text-gray-500">
                        {selectedSources.length} source documents currently integrated into vector memory context
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages stream */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {activeSession?.messages && activeSession.messages.length > 0 ? (
                    activeSession.messages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 max-w-[80%] ${
                          m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex justify-center items-center text-xs shrink-0 ${
                            m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-indigo-400'
                          }`}
                        >
                          {m.role === 'user' ? 'U' : 'AI'}
                        </div>
                        <div
                          className={`rounded-xl p-4.5 text-sm leading-relaxed ${
                            m.role === 'user'
                              ? 'bg-indigo-600/20 border border-indigo-500/20 text-white'
                              : 'bg-white/5 border border-white/10 text-gray-300'
                          }`}
                        >
                          {m.content}
                          <span className="text-[9px] text-gray-500 block mt-2 text-right">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col justify-center items-center h-full text-center space-y-3">
                      <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                      <h4 className="text-sm font-bold text-white">Ask the Copilot Anything</h4>
                      <p className="text-xs text-gray-500 max-w-sm">
                        Supply source files and type questions. The RAG engine returns accurate context insights with citation hints.
                      </p>
                    </div>
                  )}

                  {chatLoading && (
                    <div className="flex gap-3 max-w-[80%] mr-auto">
                      <div className="w-7 h-7 rounded-full bg-white/10 text-indigo-400 flex justify-center items-center text-xs shrink-0">
                        AI
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4.5 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                        <span className="text-xs text-gray-400">Searching sources & generating response...</span>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Chat Inputs */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-white/5 shrink-0">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type a research question or concept inquiry..."
                      className="flex-1 px-4 py-2.5 bg-white/5 border border-white/15 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !chatMessage.trim()}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0"
                    >
                      Ask
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Follow ups */}
                  <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
                    {[
                      'Summarize main methodology',
                      'Identify core research gaps',
                      'Compare active source findings'
                    ].map((f, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setChatMessage(f)}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-400 hover:text-white whitespace-nowrap transition-all"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SOURCE LIBRARY */}
          {activeTab === 'sources' && (
            <motion.div
              key="sources-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: List existing sources */}
              <div className="lg:col-span-2 bg-white/5 rounded-xl p-6 border border-white/10 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Library className="w-5 h-5 text-emerald-400" />
                    Source Catalog
                  </h3>
                  <span className="text-xs text-gray-500 font-bold">{sources.length} Catalogued</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-1">
                  {sources.length > 0 ? (
                    sources.map(src => (
                      <div
                        key={src._id}
                        onClick={() => setActiveSourceDetails(src)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
                          activeSourceDetails?._id === src._id
                            ? 'bg-indigo-600/10 border-indigo-500/50'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-bold text-white truncate max-w-[170px]" title={src.title}>
                              {src.title}
                            </h4>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              src.type === 'youtube' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {src.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 line-clamp-3">
                            {src.summary || 'Click to view extracted details and key terms.'}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[9px] text-gray-500">
                          <span>Confidence score: <strong>{(src.metadata?.confidenceScore * 100 || 88).toFixed(0)}%</strong></span>
                          <span>Added: {new Date(src.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-20 text-xs text-gray-500">
                      No sources indexed yet. Complete the upload form to import document context.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Upload Forms & Fallacy Viewer */}
              <div className="space-y-6">
                {/* Upload Form */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-6">
                  <div>
                    <h4 className="text-md font-bold text-white flex items-center gap-1.5">
                      <Plus className="w-5 h-5 text-indigo-400" />
                      Index New Resource
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">Submit URLs, YouTube links, or upload documents directly.</p>
                  </div>

                  {/* Upload type selection */}
                  <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={() => setUploadType('url')}
                      className={`flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all ${
                        uploadType === 'url' ? 'bg-indigo-600 text-white' : 'text-gray-400'
                      }`}
                    >
                      Web Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadType('file')}
                      className={`flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all ${
                        uploadType === 'file' ? 'bg-indigo-600 text-white' : 'text-gray-400'
                      }`}
                    >
                      Document File
                    </button>
                  </div>

                  <form onSubmit={handleUploadSource} className="space-y-4">
                    {uploadType === 'url' ? (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                          URL / YouTube Link
                        </label>
                        <input
                          type="url"
                          value={uploadUrl}
                          onChange={(e) => setUploadUrl(e.target.value)}
                          placeholder="https://example.com/paper or youtube.com/..."
                          className="block w-full px-3.5 py-2 bg-white/5 border border-white/15 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                          Attach Document (PDF, TXT, DOCX)
                        </label>
                        <div className="border-2 border-dashed border-white/15 rounded-lg p-6 flex flex-col justify-center items-center cursor-pointer hover:border-indigo-500 transition-colors relative">
                          <input
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            accept=".pdf,.txt,.docx"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-xs text-white font-semibold">
                            {selectedFile ? selectedFile.name : 'Select or drag document'}
                          </span>
                          <span className="text-[10px] text-gray-500 mt-1">PDF, TXT, DOCX files up to 50MB</span>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={uploadLoading}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex justify-center items-center gap-1.5"
                    >
                      {uploadLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      Process & Index Source
                    </button>
                  </form>
                </div>

                {/* Contradiction Checker alerts */}
                {uploadContradictions.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4.5 space-y-2">
                    <h5 className="text-xs font-extrabold text-red-400 flex items-center gap-1.5 uppercase">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Fallacies / Contradictions flagged
                    </h5>
                    <ul className="list-disc pl-4 text-[11px] text-gray-400 space-y-1">
                      {uploadContradictions.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: CITATION MANAGER */}
          {activeTab === 'citations' && (
            <motion.div
              key="citations-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Citations lists */}
              <div className="lg:col-span-2 bg-white/5 rounded-xl p-6 border border-white/10 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-indigo-400" />
                    Bibliography Reference List
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadBibTeX}
                      disabled={citations.length === 0}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-750 disabled:opacity-50 text-[10px] font-bold text-white rounded uppercase tracking-wider transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download BibTeX
                    </button>
                  </div>
                </div>

                {/* Format selection tab bar */}
                <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10 max-w-sm">
                  {['apa', 'mla', 'chicago', 'ieee'].map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSelectedCitationFormat(fmt)}
                      className={`flex-1 py-1 text-center text-[10px] font-bold rounded uppercase tracking-wider transition-all ${
                        selectedCitationFormat === fmt ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {citations.length > 0 ? (
                    citations.map(cit => (
                      <div
                        key={cit._id}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl relative group flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-bold uppercase">
                            {selectedCitationFormat.toUpperCase()} Format
                          </span>
                          <p className="text-xs text-gray-300 italic pr-8">
                            {cit.formattedCitations?.[selectedCitationFormat] || cit.title}
                          </p>
                        </div>
                        <div className="mt-3 flex justify-between items-center text-[10px] text-gray-500 pt-2.5 border-t border-white/5">
                          <span>Authors: {cit.authors?.join(', ') || 'Unknown'}</span>
                          <button
                            onClick={() => handleCopyCitation(cit.formattedCitations?.[selectedCitationFormat])}
                            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy String
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 text-xs text-gray-500">
                      No citations indexed. Choose active sources to convert or add manually.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Custom citation compiler */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-6">
                <div>
                  <h4 className="text-md font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-400" />
                    Compile Manual Citation
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">Direct bibliography entries format compiler.</p>
                </div>

                <form onSubmit={handleCreateCitation} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Title of work</label>
                    <input
                      type="text"
                      required
                      value={citationForm.title}
                      onChange={(e) => setCitationForm({ ...citationForm, title: e.target.value })}
                      placeholder="e.g. Quantum Computing Outlines"
                      className="block w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Authors (comma separated)</label>
                    <input
                      type="text"
                      value={citationForm.authors}
                      onChange={(e) => setCitationForm({ ...citationForm, authors: e.target.value })}
                      placeholder="e.g. John Doe, Alice Smith"
                      className="block w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Publisher</label>
                      <input
                        type="text"
                        value={citationForm.publisher}
                        onChange={(e) => setCitationForm({ ...citationForm, publisher: e.target.value })}
                        placeholder="e.g. Academic Press"
                        className="block w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Publish Year</label>
                      <input
                        type="text"
                        value={citationForm.publishYear}
                        onChange={(e) => setCitationForm({ ...citationForm, publishYear: e.target.value })}
                        placeholder="e.g. 2024"
                        className="block w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">URL (optional)</label>
                    <input
                      type="url"
                      value={citationForm.url}
                      onChange={(e) => setCitationForm({ ...citationForm, url: e.target.value })}
                      placeholder="https://example.com/quantum"
                      className="block w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={citationLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex justify-center items-center gap-1.5"
                  >
                    {citationLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    Format & Append
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 5: NOTES WORKSPACE */}
          {activeTab === 'notes' && (
            <motion.div
              key="notes-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              {/* Left Column: Folders & Note index */}
              <div className="lg:col-span-1 bg-white/5 rounded-xl p-4.5 border border-white/10 space-y-4">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                  <FolderOpen className="w-4 h-4" />
                  Notes Directory
                </h4>
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  {notes.map(n => (
                    <button
                      key={n._id}
                      onClick={() => {
                        setActiveNote(n);
                        setNoteTitle(n.title);
                        setNoteContent(n.content);
                        setNoteFolder(n.folder || 'General');
                        setNoteTags(n.tags ? n.tags.join(', ') : '');
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-all truncate block ${
                        activeNote?._id === n._id ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      📁 {n.folder || 'General'} / {n.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note Editor Workspace */}
              <div className="lg:col-span-3 bg-white/5 rounded-xl border border-white/10 flex flex-col h-[520px] overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Notes Workspace Editor</h4>
                      <p className="text-[10px] text-gray-500">Edit rich-text outline draft or copy generated layouts</p>
                    </div>
                  </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Title</label>
                        <input
                          type="text"
                          value={noteTitle}
                          onChange={(e) => setNoteTitle(e.target.value)}
                          className="block w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Folder</label>
                        <input
                          type="text"
                          value={noteFolder}
                          onChange={(e) => setNoteFolder(e.target.value)}
                          className="block w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Markdown Body</label>
                      <textarea
                        rows={11}
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        className="block w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-lg text-xs font-mono text-gray-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] text-gray-500">
                      Word Count: {noteContent ? noteContent.split(/\s+/).length : 0} words
                    </span>
                    <button
                      onClick={() => handleCopyCitation(noteContent)}
                      className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Notes
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: MIND MAP VIEW */}
          {activeTab === 'mindmap' && (
            <motion.div
              key="mindmap-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Controls bar */}
              <div className="bg-white/5 rounded-xl p-4.5 border border-white/10 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Concept Source:</label>
                  <select
                    value={mindmapTargetType}
                    onChange={(e) => setMindmapTargetType(e.target.value)}
                    className="px-3 py-1.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value="source">Index Source Document</option>
                    <option value="note">Notes Workspace File</option>
                    <option value="text">Direct text input</option>
                  </select>

                  {mindmapTargetType !== 'text' ? (
                    <select
                      value={mindmapTargetId}
                      onChange={(e) => setMindmapTargetId(e.target.value)}
                      className="px-3 py-1.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white focus:outline-none max-w-xs"
                    >
                      <option value="">Select target...</option>
                      {mindmapTargetType === 'source'
                        ? sources.map(s => <option key={s._id} value={s._id}>{s.title}</option>)
                        : notes.map(n => <option key={n._id} value={n._id}>{n.title}</option>)
                      }
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={mindmapCustomText}
                      onChange={(e) => setMindmapCustomText(e.target.value)}
                      placeholder="Insert text concepts..."
                      className="px-3 py-1.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none"
                    />
                  )}
                </div>

                <button
                  onClick={handleCreateMindMap}
                  disabled={mindmapLoading}
                  className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-xs font-bold text-white rounded-lg uppercase tracking-wider transition-all flex items-center gap-1.5"
                >
                  {mindmapLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Render Map
                </button>
              </div>

              {/* Graphic Canvas */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Node details panel */}
                <div className="lg:col-span-1 bg-white/5 rounded-xl p-4.5 border border-white/10 space-y-4">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                    <Compass className="w-4 h-4" />
                    Concept attributes
                  </h4>
                  {selectedMindmapNode ? (
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <span className="text-[9px] bg-indigo-500/10 text-indigo-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          {selectedMindmapNode.type} Node
                        </span>
                        <h5 className="text-sm font-bold text-white mt-1.5">{selectedMindmapNode.label}</h5>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        This concept represents a {selectedMindmapNode.type} branch within the researched topic tree.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">Click on any map node to display attributes.</p>
                  )}
                </div>

                {/* SVG Visual network tree */}
                <div className="lg:col-span-3 bg-white/5 rounded-xl border border-white/10 h-[500px] relative overflow-hidden flex justify-center items-center">
                  {mindmapData ? (
                    <svg className="w-full h-full" viewBox="0 0 700 500">
                      {/* Lines */}
                      {linksWithCoords.map((l, i) => (
                        <line
                          key={i}
                          x1={l.sourceX}
                          y1={l.sourceY}
                          x2={l.targetX}
                          y2={l.targetY}
                          stroke="rgba(99, 102, 241, 0.4)"
                          strokeWidth="2.5"
                          strokeDasharray="4 2"
                        />
                      ))}

                      {/* Nodes */}
                      {nodesWithCoords.map((n) => (
                        <g
                          key={n.id}
                          transform={`translate(${n.x}, ${n.y})`}
                          className="cursor-pointer group"
                          onClick={() => setSelectedMindmapNode(n)}
                        >
                          <circle
                            r={n.type === 'root' ? 24 : (n.type === 'category' ? 18 : 12)}
                            fill={
                              n.type === 'root'
                                ? '#4F46E5'
                                : (n.type === 'category' ? '#10B981' : '#EC4899')
                            }
                            stroke="rgba(255, 255, 255, 0.15)"
                            strokeWidth="2.5"
                            className="transition-all duration-300 group-hover:scale-110"
                          />
                          <text
                            y={n.type === 'root' ? 38 : (n.type === 'category' ? 28 : 22)}
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize="9px"
                            fontWeight="bold"
                            className="pointer-events-none drop-shadow-md"
                          >
                            {n.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  ) : (
                    <div className="text-center text-xs text-gray-500 space-y-2.5">
                      <Compass className="w-8 h-8 mx-auto text-indigo-400 animate-spin" />
                      <p>Adjust selection parameters and click "Render Map" to draw the concept tree.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default ResearchCopilot;
