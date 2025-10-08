import { useState, useEffect } from 'react';
import { DeliverableStatusMaster } from '../types';
import Modal from './Modal';

interface DeliverableStatusMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (statusData: Partial<DeliverableStatusMaster>) => void;
  status?: DeliverableStatusMaster | null;
  mode: 'create' | 'edit';
}

export default function DeliverableStatusMasterModal({ isOpen, onClose, onSave, status, mode }: DeliverableStatusMasterModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    color: '#f3f4f6',
  });

  useEffect(() => {
    if (status && mode === 'edit') {
      setFormData({
        name: status.name,
        color: status.color,
      });
    } else {
      setFormData({
        name: '',
        color: '#f3f4f6',
      });
    }
  }, [status, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const statusData: Partial<DeliverableStatusMaster> = {
      name: formData.name.trim(),
      color: formData.color,
    };

    onSave(statusData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const predefinedColors = [
    '#f3f4f6', '#fef3c7', '#d1fae5', '#fee2e2', '#dbeafe',
    '#e0e7ff', '#f3e8ff', '#fce7f3', '#fef2f2', '#f0fdf4'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? '成果物ステータス作成' : '成果物ステータス編集'}
    >
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="status-name">ステータス名 *</label>
          <input
            id="status-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="ステータス名を入力"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="status-color">カラー</label>
          <div className="color-picker">
            <input
              id="status-color"
              type="color"
              value={formData.color}
              onChange={(e) => handleChange('color', e.target.value)}
            />
            <div className="predefined-colors">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange('color', color)}
                />
              ))}
            </div>
          </div>
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
