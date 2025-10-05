import { useState } from 'react';
import { MdEdit, MdDelete, MdSave, MdCancel } from 'react-icons/md';
import { Project } from '../types';
import { updateProject } from '../services/databaseAdapter';
import ProjectDeleteModal from './ProjectDeleteModal';

interface ProjectSettingsProps {
  project: Project | null;
  onProjectUpdate?: (updatedProject: Project) => void;
  onProjectDelete?: () => void;
}

export default function ProjectSettings({ project, onProjectUpdate, onProjectDelete }: ProjectSettingsProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [projectName, setProjectName] = useState(project?.name || '');
  const [projectDescription, setProjectDescription] = useState(project?.description || '');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!project) {
    return (
      <div className="project-settings">
        <div className="project-settings-header">
          <h3>プロジェクト設定</h3>
        </div>
        <div className="no-project-selected">
          <p>プロジェクトが選択されていません</p>
        </div>
      </div>
    );
  }

  const handleEditName = () => {
    setIsEditingName(true);
    setProjectName(project.name);
  };

  const handleCancelName = () => {
    setIsEditingName(false);
    setProjectName(project.name);
  };

  const handleSaveName = async () => {
    try {
      const updatedProject = await updateProject(project.id, {
        name: projectName.trim(),
      });
      setIsEditingName(false);
      onProjectUpdate?.(updatedProject);
    } catch (error) {
      console.error('プロジェクト名の更新に失敗しました:', error);
      alert('プロジェクト名の更新に失敗しました');
    }
  };

  const handleEditDescription = () => {
    setIsEditingDescription(true);
    setProjectDescription(project.description || '');
  };

  const handleCancelDescription = () => {
    setIsEditingDescription(false);
    setProjectDescription(project.description || '');
  };

  const handleSaveDescription = async () => {
    try {
      const updatedProject = await updateProject(project.id, {
        description: projectDescription.trim() || undefined,
      });
      setIsEditingDescription(false);
      onProjectUpdate?.(updatedProject);
    } catch (error) {
      console.error('説明の更新に失敗しました:', error);
      alert('説明の更新に失敗しました');
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setIsDeleteModalOpen(false);
    onProjectDelete?.();
  };

  return (
    <div className="project-settings">
      <div className="project-settings-content">
        <div className="settings-section">
          <h4>基本情報</h4>

          <div className="setting-item">
            <label>プロジェクト名</label>
            {isEditingName ? (
              <div className="edit-field">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="project-name-input"
                  placeholder="プロジェクト名を入力"
                />
                <div className="edit-actions">
                  <button onClick={handleCancelName} className="btn-secondary">
                    <MdCancel size={20} />
                    キャンセル
                  </button>
                  <button onClick={handleSaveName} className="btn-primary">
                    <MdSave size={20} />
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div className="setting-value">
                <span>{project.name}</span>
                <button onClick={handleEditName} className="btn-icon edit-btn">
                  <MdEdit size={20} style={{color: '#3b82f6'}} />
                </button>
              </div>
            )}
          </div>

          <div className="setting-item">
            <label>説明</label>
            {isEditingDescription ? (
              <div className="edit-field">
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="project-description-input"
                  placeholder="プロジェクトの説明を入力"
                  rows={3}
                />
                <div className="edit-actions">
                  <button onClick={handleCancelDescription} className="btn-secondary">
                    <MdCancel size={20} />
                    キャンセル
                  </button>
                  <button onClick={handleSaveDescription} className="btn-primary">
                    <MdSave size={20} />
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div className="setting-value">
                <span>{project.description || '説明が設定されていません'}</span>
                <button onClick={handleEditDescription} className="btn-icon edit-btn">
                  <MdEdit size={20} style={{color: '#3b82f6'}} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="settings-section danger-zone">
          <h4>危険な操作</h4>
          <div className="setting-item">
            <label>プロジェクトの削除</label>
            <p className="setting-description">
              このプロジェクトとすべての関連データが完全に削除されます。この操作は取り消せません。
            </p>
            <button onClick={handleDelete} className="btn-danger">
              <MdDelete size={20} />
              プロジェクトを削除
            </button>
          </div>
        </div>
      </div>

      <ProjectDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        project={project}
      />
    </div>
  );
}