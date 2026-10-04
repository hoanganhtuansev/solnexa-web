import React, { useState, useEffect } from 'react';
import { Sidebar, ProjectSubView } from './components/Sidebar';
import { Header } from './components/Header';
import { ActiveTab } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { ProjectsTab } from './components/ProjectsTab';
import { ProjectWorkspace } from './components/ProjectWorkspace';
import { CableLibraryTab } from './components/CableLibraryTab';
import { PriceBookTab } from './components/PriceBookTab';
import { IngestionTab } from './components/IngestionTab';
import { ReviewWorkbench } from './components/ReviewWorkbench';
import { EquipmentLibrary } from './components/EquipmentLibrary';
import { EngineeringCalculators } from './components/EngineeringCalculators';
import { QuickEngineeringTab } from './components/QuickEngineeringTab';
import { BOQQuotation } from './components/BOQQuotation';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { SettingsModal } from './components/SettingsModal';
import { SettingsTab } from './components/SettingsTab';
import { IngestionResult, DashboardStats } from './types';
import { motion, AnimatePresence } from 'motion/react';

// Corporate Portal Components (Solar Frontier & JPEA standard style)
import { CorporateHeader, CorporateTab } from './components/corporate/CorporateHeader';
import { CorporateFooter } from './components/corporate/CorporateFooter';
import { CorporateHomeView } from './components/corporate/CorporateHomeView';
import { SolutionsView } from './components/corporate/SolutionsView';
import { KnowledgeView } from './components/corporate/KnowledgeView';
import { ProductsView } from './components/corporate/ProductsView';
import { ProjectsView } from './components/corporate/ProjectsView';
import { NewsView } from './components/corporate/NewsView';
import { AiConsultantView } from './components/corporate/AiConsultantView';
import { CompanyView, CompanySubTab } from './components/corporate/CompanyView';
import { LoginModal } from './components/corporate/LoginModal';
import { ContactModal } from './components/corporate/ContactModal';
import { CompanyProfileModal } from './components/corporate/CompanyProfileModal';
import { ChatBotWidget } from './components/corporate/ChatBotWidget';

export default function App() {
  // Top-level mode: 'corporate' (Portal website) vs 'engineering' (Comprehensive Design Workspace)
  const [portalMode, setPortalMode] = useState<'corporate' | 'engineering'>('corporate');
  const [corporateTab, setCorporateTab] = useState<CorporateTab>('home');
  const [companySubTab, setCompanySubTab] = useState<CompanySubTab>('overview');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [activeProjectId, setActiveProjectId] = useState<string>('proj-chiba-solar');
  const [projectSubView, setProjectSubView] = useState<ProjectSubView>('overview');
  
  // Modals & User State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCompanyProfileOpen, setIsCompanyProfileOpen] = useState(false);
  const [contactDefaultType, setContactDefaultType] = useState('technical_consulting');
  const [activeAiPrompt, setActiveAiPrompt] = useState<string | undefined>(undefined);
  const [solutionSubTab, setSolutionSubTab] = useState<'bess' | 'solar' | 'ppa' | 'grid' | 'ems'>('grid');
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  
  // Default to guest mode (unauthenticated client) whenever opened
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check real backend session via HttpOnly signed cookie on initial load
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          setCurrentUser(data.user);
          setIsLoggedIn(true);
        } else {
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
      })
      .catch(() => {
        setCurrentUser(null);
        setIsLoggedIn(false);
      });
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleNavigateCorporate = (tab: CorporateTab, subTab?: string) => {
    setCorporateTab(tab);
    if (tab === 'solutions' && subTab) {
      setSolutionSubTab(subTab as any);
    }
    if (tab === 'company' && subTab) {
      setCompanySubTab(subTab as CompanySubTab);
    }
    setIsCompanyProfileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDesignQuotation = () => {
    setContactDefaultType('design_quotation');
    setIsContactModalOpen(true);
  };

  const handleOpenEngineeringTool = (view: ProjectSubView, projectId: string = 'proj-chiba-solar') => {
    setActiveProjectId(projectId);
    setProjectSubView(view);
    setActiveTab('workspace');
    setPortalMode('engineering');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Engineering internal states
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [approvedCount, setApprovedCount] = useState<number>(0);
  const [activeModelForReview, setActiveModelForReview] = useState<string | undefined>(undefined);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiProviderName, setAiProviderName] = useState<string>('Gemini 3.8 Flash');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load stats from backend
  const refreshStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const stats: DashboardStats = await res.json();
        setPendingCount(stats.pendingVerificationCount);
        setApprovedCount(stats.approvedEquipmentCount);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Check URL parameters on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === '1') {
      setIsDiagnosticsOpen(true);
    }
    const modeParam = urlParams.get('mode');
    if (modeParam === 'tools' || modeParam === 'engineering') {
      setPortalMode('engineering');
    }
    const corpTabParam = urlParams.get('section') as CorporateTab;
    if (corpTabParam) {
      setCorporateTab(corpTabParam);
      setPortalMode('corporate');
    }
    const tabParam = urlParams.get('tab') as ActiveTab;
    if (tabParam) {
      setActiveTab(tabParam);
      setPortalMode('engineering');
    }
    const projectParam = urlParams.get('project');
    if (projectParam) {
      setActiveProjectId(projectParam);
      setActiveTab('workspace');
      setPortalMode('engineering');
    }
    refreshStats();
  }, []);

  const handleIngestionComplete = (result: IngestionResult) => {
    refreshStats();
    setActiveModelForReview(result.equipment.id);
    setActiveTab('review');
    setPortalMode('engineering');
  };

  const handleNavigateToReview = (modelId: string) => {
    setActiveModelForReview(modelId);
    setActiveTab('review');
    setPortalMode('engineering');
  };

  const handleCommittedToLibrary = (modelId: string) => {
    refreshStats();
    setActiveTab('library');
    setPortalMode('engineering');
  };

  const handleOpenProject = (projectId: string, view: ProjectSubView = 'overview') => {
    setActiveProjectId(projectId);
    setProjectSubView(view);
    setActiveTab('workspace');
    setPortalMode('engineering');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewProject = (type: 'SOLAR_PV' | 'BESS') => {
    if (type === 'SOLAR_PV') {
      setActiveProjectId('proj-chiba-solar');
      setProjectSubView('overview');
      setActiveTab('workspace');
    } else {
      setActiveProjectId('proj-tokyo-bess');
      setProjectSubView('overview');
      setActiveTab('workspace');
    }
    setPortalMode('engineering');
  };

  const handleQuickTool = (toolName: string) => {
    setActiveProjectId('proj-chiba-solar');
    setActiveTab('workspace');
    setPortalMode('engineering');
    if (toolName === 'cables') {
      setProjectSubView('cable-voltage-drop');
    } else if (toolName === 'string-design') {
      setProjectSubView('string-design');
    } else if (toolName === 'pcs') {
      setProjectSubView('pcs');
    } else if (toolName === 'transformer') {
      setProjectSubView('transformer');
    } else if (toolName === 'quotation') {
      setProjectSubView('quotation');
    } else {
      setProjectSubView('overview');
    }
  };

  const handleProviderChanged = (provider: string) => {
    if (provider === 'gemini') setAiProviderName('Gemini 3.8 Flash');
    else if (provider === 'openai') setAiProviderName('OpenAI GPT-4o');
    else if (provider === 'claude') setAiProviderName('Claude 3.5 Sonnet');
    else setAiProviderName(provider);
  };

  // --- RENDER 1: CORPORATE PORTAL WEBSITE (Mode: 'corporate') ---
  if (portalMode === 'corporate') {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 font-sans selection:bg-amber-500/20 selection:text-amber-900 overflow-x-hidden w-full max-w-full">
        {/* Corporate Global Header */}
        <CorporateHeader
          currentTab={corporateTab}
          onNavigateTab={handleNavigateCorporate}
          onOpenEngineeringTools={() => {
            setPortalMode('engineering');
            setActiveTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenEngineeringTool={handleOpenEngineeringTool}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenContact={() => {
            setContactDefaultType('technical_consulting');
            setIsContactModalOpen(true);
          }}
          onOpenDesignQuotation={handleOpenDesignQuotation}
          onOpenCompanyProfile={() => handleNavigateCorporate('company')}
          onOpenChatBot={() => setIsChatBotOpen(true)}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          onLogout={handleLogout}
          onAskAiPrompt={(prompt) => {
            setActiveAiPrompt(prompt);
            setCorporateTab('ai-advisor');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Corporate Main Content */}
        <main className="flex-1 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={corporateTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="w-full flex-1"
            >
              {corporateTab === 'home' && (
                <CorporateHomeView
                  onNavigateTab={handleNavigateCorporate}
                  onOpenEngineeringTools={() => {
                    setPortalMode('engineering');
                    setActiveTab('dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onOpenEngineeringTool={handleOpenEngineeringTool}
                  onOpenContact={() => {
                    setContactDefaultType('technical_consulting');
                    setIsContactModalOpen(true);
                  }}
                  onOpenCompanyProfile={() => handleNavigateCorporate('company')}
                  onOpenLogin={() => setIsLoginModalOpen(true)}
                  onOpenChatBot={() => setIsChatBotOpen(true)}
                  isLoggedIn={isLoggedIn}
                  isAdmin={Boolean(currentUser?.isAdmin)}
                  currentUser={currentUser}
                  onAskAiPrompt={(prompt) => {
                    setActiveAiPrompt(prompt);
                    setCorporateTab('ai-advisor');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {corporateTab !== 'home' && (
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
                  {corporateTab === 'solutions' && (
                    <SolutionsView
                      initialTab={solutionSubTab}
                      onOpenContact={handleOpenDesignQuotation}
                      onOpenEngineeringTools={() => {
                        setPortalMode('engineering');
                        setActiveTab('workspace');
                        setProjectSubView('overview');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  )}

                  {corporateTab === 'knowledge' && (
                    <KnowledgeView
                      onOpenEngineeringTools={() => {
                        setPortalMode('engineering');
                        setActiveTab('quick-engineering');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onOpenContact={() => {
                        setContactDefaultType('technical_consulting');
                        setIsContactModalOpen(true);
                      }}
                      currentUser={currentUser}
                      isLoggedIn={isLoggedIn}
                      onOpenLogin={() => setIsLoginModalOpen(true)}
                    />
                  )}

                  {corporateTab === 'products' && (
                    <ProductsView
                      onOpenContact={() => {
                        setContactDefaultType('equipment_quotation');
                        setIsContactModalOpen(true);
                      }}
                      onOpenEngineeringTools={() => {
                        setPortalMode('engineering');
                        setActiveTab('library');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  )}

                  {corporateTab === 'projects' && (
                    <ProjectsView
                      onOpenContact={() => {
                        setContactDefaultType('bess_project');
                        setIsContactModalOpen(true);
                      }}
                      onOpenEngineeringTools={() => {
                        setPortalMode('engineering');
                        setActiveTab('projects');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  )}

                  {corporateTab === 'news' && (
                    <NewsView
                      onOpenContact={() => {
                        setContactDefaultType('catalog_request');
                        setIsContactModalOpen(true);
                      }}
                      isAdmin={Boolean(currentUser?.isAdmin)}
                      currentUser={currentUser}
                    />
                  )}

                  {corporateTab === 'ai-advisor' && (
                    <AiConsultantView
                      initialPrompt={activeAiPrompt}
                      onOpenContact={() => {
                        setContactDefaultType('technical_consulting');
                        setIsContactModalOpen(true);
                      }}
                      onOpenEngineeringTools={() => {
                        setPortalMode('engineering');
                        setActiveTab('dashboard');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  )}

                  {corporateTab === 'company' && (
                    <CompanyView
                      initialTab={companySubTab}
                      onOpenContact={() => {
                        setContactDefaultType('technical_consulting');
                        setIsContactModalOpen(true);
                      }}
                      onOpenDesignQuotation={handleOpenDesignQuotation}
                      onNavigateTab={handleNavigateCorporate}
                    />
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Corporate Global Footer */}
        <CorporateFooter
          onNavigateTab={handleNavigateCorporate}
          onOpenEngineeringTools={() => {
            setPortalMode('engineering');
            setActiveTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenContact={() => {
            setContactDefaultType('technical_consulting');
            setIsContactModalOpen(true);
          }}
          onOpenCompanyProfile={() => handleNavigateCorporate('company')}
        />

        {/* Modals */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          currentUser={currentUser}
        />

        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          defaultType={contactDefaultType}
        />

        <CompanyProfileModal
          isOpen={isCompanyProfileOpen}
          onClose={() => setIsCompanyProfileOpen(false)}
          onOpenContact={() => {
            setIsCompanyProfileOpen(false);
            setContactDefaultType('technical_consulting');
            setIsContactModalOpen(true);
          }}
          onOpenDesignQuotation={() => {
            setIsCompanyProfileOpen(false);
            handleOpenDesignQuotation();
          }}
        />

        {/* Floating Multi-Turn Gemini AI Technical Chatbot */}
        <ChatBotWidget
          isOpen={isChatBotOpen}
          onOpen={() => setIsChatBotOpen(true)}
          onClose={() => setIsChatBotOpen(false)}
          onOpenContact={() => {
            setContactDefaultType('technical_consulting');
            setIsContactModalOpen(true);
          }}
          onOpenEngineeringTools={() => {
            setPortalMode('engineering');
            setActiveTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenDesignQuotation={handleOpenDesignQuotation}
        />
      </div>
    );
  }

  // --- RENDER 2: INTEGRATED ENGINEERING DESIGN PLATFORM (Mode: 'engineering') ---
  return (
    <div className="min-h-screen text-slate-800 bg-[#f8fafc] font-sans selection:bg-amber-500/20 selection:text-amber-900 relative overflow-x-hidden flex">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30 md:hidden transition-opacity"
        />
      )}

      {/* 1. Left Vertical Dark Navy Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={tab => {
          setActiveTab(tab);
          if (tab === 'workspace') setProjectSubView('overview');
        }}
        activeProjectSubView={projectSubView}
        onSelectProjectSubView={view => {
          setProjectSubView(view);
          setActiveTab('workspace');
        }}
        onExitProjectToProjects={() => setActiveTab('projects')}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        onBackToCorporate={() => {
          setPortalMode('corporate');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 2. Main Web Layout Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-250 ease-in-out relative z-10 ${
          isSidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
        }`}
      >
        {/* Top Header Bar */}
        <Header
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          projectName="Chiba Factory Solar"
          activeProjectSubView={projectSubView}
          onSelectProjectSubView={setProjectSubView}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isSidebarCollapsed={isSidebarCollapsed}
          onOpenSettings={() => setActiveTab('settings')}
          onBackToCorporate={() => {
            setPortalMode('corporate');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentUser={currentUser}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />

        {/* Animated Main Content View */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${projectSubView}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="w-full flex-1"
            >
              {activeTab === 'dashboard' && (
                <DashboardTab
                  onNavigateToTab={setActiveTab}
                  onOpenProject={id => handleOpenProject(id, 'overview')}
                  onNewProject={handleNewProject}
                  onOpenQuickTool={handleQuickTool}
                />
              )}

              {activeTab === 'projects' && (
                <ProjectsTab
                  onOpenProject={id => handleOpenProject(id, 'overview')}
                />
              )}

              {activeTab === 'workspace' && (
                <ProjectWorkspace
                  projectId={activeProjectId}
                  subView={projectSubView}
                  onSelectSubView={setProjectSubView}
                  onBack={() => setActiveTab('projects')}
                  onOpenLibrary={() => setActiveTab('library')}
                  onOpenDatasheets={() => setActiveTab('datasheets')}
                />
              )}

              {activeTab === 'library' && (
                <EquipmentLibrary />
              )}

              {(activeTab === 'datasheets' || activeTab === 'ingest') && (
                <IngestionTab
                  onIngestionComplete={handleIngestionComplete}
                  onNavigateToReview={handleNavigateToReview}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              )}

              {activeTab === 'review' && (
                <ReviewWorkbench
                  initialModelId={activeModelForReview}
                  onCommittedToLibrary={handleCommittedToLibrary}
                />
              )}

              {activeTab === 'cables' && (
                <CableLibraryTab />
              )}

              {activeTab === 'price-book' && (
                <PriceBookTab />
              )}

              {(activeTab === 'quick-engineering' || activeTab === 'tools' || activeTab === 'calculators') && (
                <QuickEngineeringTab
                  onOpenProject={id => handleOpenProject(id, 'overview')}
                  onSaveToProject={(calc) => {
                    handleOpenProject('proj-chiba-solar', 'cable-voltage-drop');
                  }}
                  isLoggedIn={isLoggedIn}
                  onOpenLogin={() => setIsLoginModalOpen(true)}
                />
              )}

              {activeTab === 'boq' && (
                <BOQQuotation />
              )}

              {activeTab === 'settings' && (
                <SettingsTab
                  onNavigateToTab={setActiveTab}
                  onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
                  onProviderChanged={handleProviderChanged}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Diagnostics Modal */}
      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />

      {/* AI Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onProviderChanged={handleProviderChanged}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        defaultType={contactDefaultType}
      />

      {/* Company Profile Modal */}
      <CompanyProfileModal
        isOpen={isCompanyProfileOpen}
        onClose={() => setIsCompanyProfileOpen(false)}
        onOpenContact={() => {
          setIsCompanyProfileOpen(false);
          setContactDefaultType('technical_consulting');
          setIsContactModalOpen(true);
        }}
        onOpenDesignQuotation={() => {
          setIsCompanyProfileOpen(false);
          handleOpenDesignQuotation();
        }}
      />

      {/* Floating Multi-Turn Gemini AI Technical Chatbot */}
      <ChatBotWidget
        onOpenContact={() => {
          setContactDefaultType('technical_consulting');
          setIsContactModalOpen(true);
        }}
        onOpenEngineeringTools={() => {
          setActiveTab('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenDesignQuotation={handleOpenDesignQuotation}
      />
    </div>
  );
}
