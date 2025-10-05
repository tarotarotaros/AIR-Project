import { useState } from "react";
import { MdMenu, MdMenuOpen } from 'react-icons/md';
import { Project } from "./types";
import ProjectList from "./components/ProjectList";
import ProjectTabs from "./components/ProjectTabs";

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [projectListKey, setProjectListKey] = useState(0);

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
            project={selectedProject} 
            onProjectUpdate={handleProjectUpdate}
            onProjectDelete={handleProjectDelete}
          />
        </main>
      </div>
    </div>
  );
}

export default App;