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

  const loadProjects = async () => {
    try {
      const projectsData = await getProjects();
      setProjects(projectsData);
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

  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`プロジェクト "${project.name}" を削除しますか？`)) return;
    
    try {
      await deleteProject(project.id);
      setProjects(projects.filter(p => p.id !== project.id));
      if (selectedProject?.id === project.id) {
        onSelectProject(projects[0] || null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  return (
    <div className="project-list">
      <div className="project-header">
        <h2>プロジェクト</h2>
        <button onClick={() => setIsCreating(true)}>新規作成</button>
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
            <div className="project-name">{project.name}</div>
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProject(project);
              }}
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}