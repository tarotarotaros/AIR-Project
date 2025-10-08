import { useState, useEffect } from 'react';
import { Task, AssigneeMaster, TaskStatusMaster } from '../types';
import { getAssigneeMasters, getTaskStatusMasters } from '../services/databaseAdapter';
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
    status: 1,  // ステータスマスタのID
    priority: 'medium' as Task['priority'],
    start_date: '',
    end_date: '',
    duration_days: '',
    assigned_to: 0,  // IDで管理
  });

  const [assignees, setAssignees] = useState<AssigneeMaster[]>([]);
  const [statusMasters, setStatusMasters] = useState<TaskStatusMaster[]>([]);

  // マスタデータを読み込み（モーダルが開くたびに必ず実行）
  useEffect(() => {
    const loadMasters = async () => {
      console.log('[TaskModal] Loading masters on modal open...');
      console.log('[TaskModal] localStorage task_status_masters:', localStorage.getItem('pm_task_status_masters'));
      console.log('[TaskModal] localStorage assignee_masters:', localStorage.getItem('pm_assignee_masters'));

      const assigneesData = await getAssigneeMasters();
      setAssignees(assigneesData);

      const taskStatusMasters = await getTaskStatusMasters();
      console.log('[TaskModal] Loaded status masters:', taskStatusMasters);
      setStatusMasters(taskStatusMasters);

      // デフォルトステータスを最初のマスタIDに設定
      if (taskStatusMasters.length > 0 && !task) {
        setFormData(prev => ({ ...prev, status: taskStatusMasters[0].id }));
      }
    };
    if (isOpen) {
      loadMasters();
    }
  }, [isOpen, task]);

  // ウィンドウフォーカス時にマスタデータを再読み込み
  useEffect(() => {
    const handleFocus = async () => {
      if (isOpen) {
        const assigneesData = await getAssigneeMasters();
        setAssignees(assigneesData);

        const taskStatusMasters = await getTaskStatusMasters();
        console.log('[TaskModal] Loaded status masters:', taskStatusMasters);
        setStatusMasters(taskStatusMasters);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isOpen]);

  // statusMasters変更時のログ
  useEffect(() => {
    console.log('[TaskModal] statusMasters updated:', statusMasters);
    const statusIds = statusMasters.map(s => s.id);
    const duplicateStatusIds = statusIds.filter((id, index) => statusIds.indexOf(id) !== index);
    if (duplicateStatusIds.length > 0) {
      console.error('[TaskModal] DUPLICATE STATUS IDs found:', duplicateStatusIds);
    }
  }, [statusMasters]);

  // assignees変更時のログ
  useEffect(() => {
    console.log('[TaskModal] assignees updated:', assignees);
    const assigneeIds = assignees.map(a => a.id);
    const duplicateAssigneeIds = assigneeIds.filter((id, index) => assigneeIds.indexOf(id) !== index);
    if (duplicateAssigneeIds.length > 0) {
      console.error('[TaskModal] DUPLICATE ASSIGNEE IDs found:', duplicateAssigneeIds);
    }
  }, [assignees]);

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
        assigned_to: task.assigned_to || 0,
      });
    } else if (statusMasters.length > 0) {
      setFormData({
        name: '',
        description: '',
        status: statusMasters[0].id,
        priority: 'medium',
        start_date: '',
        end_date: '',
        duration_days: '',
        assigned_to: 0,
      });
    }
  }, [task, mode, isOpen, statusMasters]);

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
      assigned_to: formData.assigned_to || undefined,
    };

    console.log('TaskModal handleSubmit:', taskData);
    onSave(taskData);
    // onClose(); // TaskFlow側で閉じるので削除
  };

  const handleChange = (field: string, value: string | number) => {
    if (field === 'assigned_to' || field === 'status') {
      setFormData(prev => ({ ...prev, [field]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
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
              {statusMasters.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
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

        <div className="form-group">
          <label htmlFor="task-assigned-to">担当者</label>
          <select
            id="task-assigned-to"
            value={formData.assigned_to}
            onChange={(e) => handleChange('assigned_to', e.target.value)}
          >
            <option value="0">選択してください</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name}
              </option>
            ))}
          </select>
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