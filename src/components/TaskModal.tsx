import { useState, useEffect } from 'react';
import { Task } from '../types';
import Modal from './Modal';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  task?: Task | null;
  mode: 'create' | 'edit';
}

export default function TaskModal({ isOpen, onClose, onSave, task, mode }: TaskModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'not_started' as Task['status'],
    priority: 'medium' as Task['priority'],
    start_date: '',
    end_date: '',
    duration_days: '',
  });

  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData({
        name: task.name,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        start_date: task.start_date || '',
        end_date: task.end_date || '',
        duration_days: task.duration_days?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'not_started',
        priority: 'medium',
        start_date: '',
        end_date: '',
        duration_days: '',
      });
    }
  }, [task, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const taskData: Partial<Task> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      duration_days: formData.duration_days ? parseInt(formData.duration_days) : undefined,
    };

    console.log('TaskModal handleSubmit:', taskData);
    onSave(taskData);
    // onClose(); // TaskFlow側で閉じるので削除
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'タスク作成' : 'タスク編集'}
    >
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="task-name">タスク名 *</label>
          <input
            id="task-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="タスク名を入力"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-description">説明</label>
          <textarea
            id="task-description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="タスクの説明を入力"
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="task-status">ステータス</label>
            <select
              id="task-status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="not_started">未開始</option>
              <option value="in_progress">進行中</option>
              <option value="completed">完了</option>
              <option value="blocked">ブロック</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-priority">優先度</label>
            <select
              id="task-priority"
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="critical">緊急</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="task-start-date">開始日</label>
            <input
              id="task-start-date"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleChange('start_date', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-end-date">終了日</label>
            <input
              id="task-end-date"
              type="date"
              value={formData.end_date}
              onChange={(e) => handleChange('end_date', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="task-duration">所要日数</label>
          <input
            id="task-duration"
            type="number"
            value={formData.duration_days}
            onChange={(e) => handleChange('duration_days', e.target.value)}
            placeholder="日数"
            min="1"
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