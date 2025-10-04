import { useState } from "react";
import { Project } from "./types";
import ProjectList from "./components/ProjectList";
import TaskFlow from "./components/TaskFlow";

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Project Manager</h1>
      </header>
      
      <div className="app-content">
        <aside className="sidebar">
          <ProjectList 
            onSelectProject={setSelectedProject}
            selectedProject={selectedProject}
          />
        </aside>
        
        <main className="main-content">
          <TaskFlow project={selectedProject} />
        </main>
      </div>
    </div>
  );
}

export default App;