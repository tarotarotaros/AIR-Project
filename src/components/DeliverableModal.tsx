import { useState, useEffect } from 'react';
import { Deliverable, DeliverableTypeMaster } from '../types';
import Modal from './Modal';
import { getDeliverableTypeMasters } from '../services/databaseAdapter';

interface DeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deliverableData: Partial<Deliverable>) => void;
  deliverable?: Deliverable | null;
  mode: 'create' | 'edit';
}

export default function DeliverableModal({ isOpen, onClose, onSave, deliverable, mode }: DeliverableModalProps) {
  const [deliverableTypeMasters, setDeliverableTypeMasters] = useState<DeliverableTypeMaster[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'not_ready' as Deliverable['status'],
    type: 1,  // デフォルトは最初のマスタID
    due_date: '',
  });

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const masters = await getDeliverableTypeMasters();
        setDeliverableTypeMasters(masters);
        // デフォルト値を最初のマスタIDに設定
        if (masters.length > 0 && !deliverable) {
          setFormData(prev => ({ ...prev, type: masters[0].id }));
        }
      } catch (error) {
        console.error('Failed to load deliverable type masters:', error);
      }
    };
    if (isOpen) {
      loadMasters();
    }
  }, [isOpen]);

  useEffect(() => {
    if (deliverable && mode === 'edit') {
      setFormData({
        name: deliverable.name,
        description: deliverable.description || '',
        status: deliverable.status,
        type: deliverable.type,
        due_date: deliverable.due_date || '',
      });
    } else if (deliverableTypeMasters.length > 0) {
      setFormData({
        name: '',
        description: '',
        status: 'not_ready',
        type: deliverableTypeMasters[0].id,
        due_date: '',
      });
    }
  }, [deliverable, mode, isOpen, deliverableTypeMasters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const deliverableData: Partial<Deliverable> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      status: formData.status,
      type: formData.type,
      due_date: formData.due_date || undefined,
    };

    console.log('DeliverableModal handleSubmit:', deliverableData);
    onSave(deliverableData);
    // onClose(); // TaskFlow側で閉じるので削除
  };

  const handleChange = (field: string, value: string) => {
    // typeフィールドは数値に変換
    const parsedValue = field === 'type' ? Number(value) : value;
    setFormData(prev => ({ ...prev, [field]: parsedValue }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? '成果物作成' : '成果物編集'}
    >
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="deliverable-name">成果物名 *</label>
          <input
            id="deliverable-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="成果物名を入力"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="deliverable-description">説明</label>
          <textarea
            id="deliverable-description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="成果物の説明を入力"
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="deliverable-status">ステータス</label>
            <select
              id="deliverable-status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="not_ready">準備中</option>
              <option value="ready">準備完了</option>
              <option value="completed">完成</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="deliverable-type">種類</label>
            <select
              id="deliverable-type"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              {deliverableTypeMasters.map((master) => (
                <option key={master.id} value={master.id}>
                  {master.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="deliverable-due-date">期限日</label>
          <input
            id="deliverable-due-date"
            type="date"
            value={formData.due_date}
            onChange={(e) => handleChange('due_date', e.target.value)}
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