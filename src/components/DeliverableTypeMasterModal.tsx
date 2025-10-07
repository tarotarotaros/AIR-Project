import { useState, useEffect } from 'react';
import { DeliverableTypeMaster } from '../types';
import Modal from './Modal';
import { iconMap } from '../utils/iconMapper';

interface DeliverableTypeMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deliverableTypeData: Partial<DeliverableTypeMaster>) => void;
  deliverableType?: DeliverableTypeMaster | null;
  mode: 'create' | 'edit';
}

export default function DeliverableTypeMasterModal({ isOpen, onClose, onSave, deliverableType, mode }: DeliverableTypeMasterModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    icon: 'MdInventory',
    color: '#6b7280',
  });

  useEffect(() => {
    if (deliverableType && mode === 'edit') {
      setFormData({
        name: deliverableType.name,
        icon: deliverableType.icon,
        color: deliverableType.color,
      });
    } else {
      setFormData({
        name: '',
        icon: 'MdInventory',
        color: '#6b7280',
      });
    }
  }, [deliverableType, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const deliverableTypeData: Partial<DeliverableTypeMaster> = {
      name: formData.name.trim(),
      icon: formData.icon,
      color: formData.color,
    };

    onSave(deliverableTypeData);
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const predefinedIcons = [
    'MdDescription', 'MdComputer', 'MdDesignServices', 'MdBarChart', 'MdInventory',
    'MdNote', 'MdFolder', 'MdFolderOpen', 'MdSettings', 'MdBuild',
    'MdChecklist', 'MdTrendingUp', 'MdTrendingDown', 'MdTrackChanges', 'MdLightbulb',
    'MdSearch', 'MdCode', 'MdDataObject', 'MdStorage', 'MdCloud'
  ];

  const predefinedColors = [
    '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#6b7280',
    '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#ec4899'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? '成果物種類作成' : '成果物種類編集'}
    >
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="deliverable-type-name">種類名 *</label>
          <input
            id="deliverable-type-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="種類名を入力"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="deliverable-type-icon">アイコン</label>
          <div className="icon-picker">
            <div className="predefined-icons">
              {predefinedIcons.map((iconName) => {
                const IconComponent = iconMap[iconName];
                return (
                  <button
                    key={iconName}
                    type="button"
                    className={`icon-option ${formData.icon === iconName ? 'selected' : ''}`}
                    onClick={() => handleChange('icon', iconName)}
                    title={iconName}
                  >
                    <IconComponent size={32} color="#000000" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="deliverable-type-color">カラー</label>
          <div className="color-picker">
            <input
              id="deliverable-type-color"
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