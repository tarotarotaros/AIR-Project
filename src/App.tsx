import { useState, useEffect } from "react";
import { MdMenu, MdMenuOpen, MdSettings } from 'react-icons/md';
import { Project } from "./types";
import ProjectList from "./components/ProjectList";
import ProjectTabs from "./components/ProjectTabs";
import Modal from "./components/Modal";
import MasterManagement from "./components/MasterManagement";
import { initializeDatabase } from "./services/sqliteDatabase";

// Tauri環境かどうかを判定
const isTauriApp = () => {
  try {
    // Tauri v2では window.__TAURI_INTERNALS__ が存在する
    return typeof window !== 'undefined' &&
           ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
  } catch {
    return false;
  }
};

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [projectListKey, setProjectListKey] = useState(0);
  const [projectTabsKey, setProjectTabsKey] = useState(0);
  const [isMasterManagementOpen, setIsMasterManagementOpen] = useState(false);

  // データベースの初期化（アプリ起動時に1回だけ実行）
  useEffect(() => {
    const init = async () => {
      const isTauri = isTauriApp();
      console.log('[App] Checking Tauri environment...', {
        isTauri,
        hasTauriInternals: typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window,
        hasTauri: typeof window !== 'undefined' && '__TAURI__' in window
      });

      // Tauri環境の場合のみSQLiteを初期化
      if (isTauri) {
        console.log('[App] Tauri environment detected, initializing database...');
        try {
          await initializeDatabase();
          console.log('[App] Database initialized successfully');
        } catch (error) {
          console.error('[App] Failed to initialize database:', error);
        }
      } else {
        console.log('[App] Not in Tauri environment, skipping database initialization');
      }
    };
    init();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setSelectedProject(updatedProject);
    setProjectListKey(prev => prev + 1); // プロジェクト一覧を再レンダリング
  };

  const handleProjectDelete = () => {
    setSelectedProject(null);
    setProjectListKey(prev => prev + 1); // プロジェクト一覧を再レンダリング
  };

  const handleMasterManagementClose = () => {
    setIsMasterManagementOpen(false);
    setProjectTabsKey(prev => prev + 1); // マスタ更新後、ProjectTabsを再マウントしてマスタデータを再読み込み
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <button
            onClick={toggleSidebar}
            className="sidebar-toggle"
            title={isSidebarCollapsed ? "プロジェクト一覧を表示" : "プロジェクト一覧を非表示"}
          >
            {isSidebarCollapsed ? <MdMenu size={24} /> : <MdMenuOpen size={24} />}
          </button>
          <h1>AIR-Project</h1>
          <button
            onClick={() => setIsMasterManagementOpen(true)}
            className="master-management-button"
            title="共通マスタ管理"
          >
            <MdSettings size={20} />
            共通マスタ
          </button>
        </div>
      </header>
      
      <div className="app-content">
        <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <ProjectList 
            key={projectListKey}
            onSelectProject={setSelectedProject}
            selectedProject={selectedProject}
          />
        </aside>
        
        <main className="main-content">
          <ProjectTabs
            key={projectTabsKey}
            project={selectedProject}
            onProjectUpdate={handleProjectUpdate}
            onProjectDelete={handleProjectDelete}
          />
        </main>
      </div>

      {/* 共通マスタ管理モーダル */}
      <Modal
        isOpen={isMasterManagementOpen}
        onClose={handleMasterManagementClose}
        title="共通マスタ管理"
        size="large"
      >
        <MasterManagement />
      </Modal>
    </div>
  );
}

export default App;