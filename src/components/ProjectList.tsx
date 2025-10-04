import { useState, useEffect } from 'react';
import { Project } from '../types';
import { getProjects, createProject, deleteProject } from '../services/mockDatabase';

interface ProjectListProps {
  onSelectProject: (project: Project) => void;
  selectedProject: Project | null;
}

export default function ProjectList({ onSelectProject, selectedProject }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  // デバッグ用：LocalStorageをクリアする関数
  const clearStorage = () => {
    if (window.confirm('LocalStorageをクリアしますか？すべてのデータが削除されます。')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const loadProjects = async () => {
    try {
      const projectsData = await getProjects();
      console.log('Loaded projects data:', projectsData);
      
      // データの整合性チェック
      const validProjects = projectsData.filter(project => {
        if (!project || typeof project !== 'object') {
          console.warn('Invalid project found:', project);
          return false;
        }
        if (typeof project.name !== 'string') {
          console.warn('Project with invalid name:', project);
          return false;
        }
        return true;
      });
      
      console.log('Valid projects:', validProjects);
      setProjects(validProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      const newProject = await createProject(newProjectName.trim());
      setProjects([newProject, ...projects]);
      setNewProjectName('');
      setIsCreating(false);
      onSelectProject(newProject);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  // 削除機能は ProjectSettings に移動したため削除

  return (
    <div className="project-list">
      <div className="project-header">
        <h2>プロジェクト</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setIsCreating(true)}>新規作成</button>
          <button onClick={clearStorage} style={{ backgroundColor: '#dc2626', color: 'white', fontSize: '0.8rem' }}>
            Reset
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="create-project">
          <input
            type="text"
            placeholder="プロジェクト名"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
            autoFocus
          />
          <button onClick={handleCreateProject}>作成</button>
          <button onClick={() => { setIsCreating(false); setNewProjectName(''); }}>
            キャンセル
          </button>
        </div>
      )}

      <div className="projects">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`project-item ${selectedProject?.id === project.id ? 'selected' : ''}`}
            onClick={() => onSelectProject(project)}
          >
            <div className="project-name">{project?.name || 'Unnamed Project'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}