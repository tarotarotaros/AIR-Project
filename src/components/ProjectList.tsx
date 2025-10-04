import { useState, useEffect } from 'react';
import { MdAdd } from 'react-icons/md';
import { Project } from '../types';
import { getProjects, createProject, deleteProject } from '../services/databaseAdapter';

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

  const loadProjects = async () => {
    try {
      const projectsData = await getProjects();
      
      // データの安全性チェック
      const validProjects = projectsData.filter(project => {
        return project && 
               typeof project === 'object' && 
               typeof project.name === 'string' &&
               typeof project.id !== 'undefined';
      });
      
      setProjects(validProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      // エラーの場合は空の配列を設定
      setProjects([]);
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
        <button 
          onClick={() => setIsCreating(true)} 
          className="btn-icon"
          title="新規プロジェクト作成"
        >
          <MdAdd size={24} />
        </button>
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