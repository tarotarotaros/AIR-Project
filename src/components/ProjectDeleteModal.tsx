import { useState } from 'react';
import { MdWarning, MdDelete } from 'react-icons/md';
import { Project } from '../types';
import { deleteProject } from '../services/databaseAdapter';
import Modal from './Modal';

interface ProjectDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  project: Project;
}

export default function ProjectDeleteModal({ isOpen, onClose, onConfirm, project }: ProjectDeleteModalProps) {
  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmName !== project.name) {
      alert('プロジェクト名が一致しません');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      onConfirm();
    } catch (error) {
      console.error('プロジェクトの削除に失敗しました:', error);
      alert('プロジェクトの削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmName('');
    onClose();
  };

  const isConfirmValid = confirmName === project.name;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="プロジェクトの削除">
      <div className="delete-modal-content">
        <div className="warning-section">
          <MdWarning size={48} style={{color: '#ef4444'}} />
          <h4>このプロジェクトを削除しますか？</h4>
          <p>
            プロジェクト「<strong>{project.name}</strong>」とすべての関連データ（タスク、成果物など）が完全に削除されます。
          </p>
          <p className="warning-text">
            <strong>この操作は取り消せません。</strong>
          </p>
        </div>

        <div className="confirmation-section">
          <label htmlFor="confirm-name">
            削除を確認するため、プロジェクト名「<strong>{project.name}</strong>」を入力してください：
          </label>
          <input
            id="confirm-name"
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder="プロジェクト名を入力"
            className="confirm-input"
            autoFocus
          />
        </div>

        <div className="modal-actions">
          <button 
            type="button" 
            onClick={handleClose} 
            className="btn-secondary"
            disabled={isDeleting}
          >
            キャンセル
          </button>
          <button 
            onClick={handleDelete} 
            className="btn-danger"
            disabled={!isConfirmValid || isDeleting}
          >
            <MdDelete size={20} />
            {isDeleting ? '削除中...' : 'プロジェクトを削除'}
          </button>
        </div>
      </div>
    </Modal>
  );
}