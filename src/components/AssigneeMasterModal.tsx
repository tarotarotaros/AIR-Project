import { useState, useEffect } from 'react';
import { AssigneeMaster } from '../types';
import Modal from './Modal';

interface AssigneeMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assigneeData: Partial<AssigneeMaster>) => void;
  assignee?: AssigneeMaster | null;
  mode: 'create' | 'edit';
}

export default function AssigneeMasterModal({ isOpen, onClose, onSave, assignee, mode }: AssigneeMasterModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    if (assignee && mode === 'edit') {
      setFormData({
        name: assignee.name,
        email: assignee.email || '',
        role: assignee.role || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: '',
      });
    }
  }, [assignee, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const assigneeData: Partial<AssigneeMaster> = {
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      role: formData.role.trim() || undefined,
    };

    onSave(assigneeData);
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? '担当者作成' : '担当者編集'}
    >
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="assignee-name">氏名 *</label>
          <input
            id="assignee-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="氏名を入力"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="assignee-email">メールアドレス</label>
          <input
            id="assignee-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="メールアドレスを入力"
          />
        </div>

        <div className="form-group">
          <label htmlFor="assignee-role">役職</label>
          <input
            id="assignee-role"
            type="text"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            placeholder="役職を入力"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            キャンセル
          </button>
          <button type="submit" className="btn-primary">
            {mode === 'create' ? '作成' : '更新'}
          </button>
        </div>
      </form>
    </Modal>
  );
}