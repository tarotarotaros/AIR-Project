import { useState, useEffect } from 'react';
import { MdLabel, MdPerson, MdInventory, MdEdit, MdDelete, MdTask, MdWork, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { TaskStatusMaster, DeliverableStatusMaster, AssigneeMaster, DeliverableTypeMaster } from '../types';
import { renderIcon } from '../utils/iconMapper';
import {
  getTaskStatusMasters, createTaskStatusMaster, updateTaskStatusMaster, deleteTaskStatusMaster,
  getDeliverableStatusMasters, createDeliverableStatusMaster, updateDeliverableStatusMaster, deleteDeliverableStatusMaster,
  getAssigneeMasters, createAssigneeMaster, updateAssigneeMaster, deleteAssigneeMaster,
  getDeliverableTypeMasters, createDeliverableTypeMaster, updateDeliverableTypeMaster, deleteDeliverableTypeMaster,
  getTasks, getDeliverables
} from '../services/databaseAdapter';
import TaskStatusMasterModal from './TaskStatusMasterModal';
import DeliverableStatusMasterModal from './DeliverableStatusMasterModal';
import AssigneeMasterModal from './AssigneeMasterModal';
import DeliverableTypeMasterModal from './DeliverableTypeMasterModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import AlertModal from './AlertModal';

type MasterType = 'taskStatus' | 'deliverableStatus' | 'assignee' | 'deliverableType';

export default function MasterManagement() {
  const [activeTab, setActiveTab] = useState<MasterType>('taskStatus');

  // Task Status Masters
  const [taskStatusMasters, setTaskStatusMasters] = useState<TaskStatusMaster[]>([]);
  const [isTaskStatusModalOpen, setIsTaskStatusModalOpen] = useState(false);
  const [taskStatusModalMode, setTaskStatusModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<TaskStatusMaster | null>(null);

  // Deliverable Status Masters
  const [deliverableStatusMasters, setDeliverableStatusMasters] = useState<DeliverableStatusMaster[]>([]);
  const [isDeliverableStatusModalOpen, setIsDeliverableStatusModalOpen] = useState(false);
  const [deliverableStatusModalMode, setDeliverableStatusModalMode] = useState<'create' | 'edit'>('create');
  const [selectedDeliverableStatus, setSelectedDeliverableStatus] = useState<DeliverableStatusMaster | null>(null);
  
  // Assignee Masters
  const [assigneeMasters, setAssigneeMasters] = useState<AssigneeMaster[]>([]);
  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);
  const [assigneeModalMode, setAssigneeModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAssignee, setSelectedAssignee] = useState<AssigneeMaster | null>(null);
  
  // Deliverable Type Masters
  const [deliverableTypeMasters, setDeliverableTypeMasters] = useState<DeliverableTypeMaster[]>([]);
  const [isDeliverableTypeModalOpen, setIsDeliverableTypeModalOpen] = useState(false);
  const [deliverableTypeModalMode, setDeliverableTypeModalMode] = useState<'create' | 'edit'>('create');
  const [selectedDeliverableType, setSelectedDeliverableType] = useState<DeliverableTypeMaster | null>(null);

  // Delete Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'taskStatus' | 'deliverableStatus' | 'assignee' | 'deliverableType';
    item: TaskStatusMaster | DeliverableStatusMaster | AssigneeMaster | DeliverableTypeMaster;
  } | null>(null);

  // Alert Modal
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertType, setAlertType] = useState<'info' | 'warning' | 'error'>('info');

  useEffect(() => {
    loadAllMasters();
  }, []);

  const loadAllMasters = async () => {
    try {
      const [taskStatusData, deliverableStatusData, assigneeData, deliverableTypeData] = await Promise.all([
        getTaskStatusMasters(),
        getDeliverableStatusMasters(),
        getAssigneeMasters(),
        getDeliverableTypeMasters()
      ]);
      setTaskStatusMasters(taskStatusData);
      setDeliverableStatusMasters(deliverableStatusData);
      setAssigneeMasters(assigneeData);
      setDeliverableTypeMasters(deliverableTypeData);
    } catch (error) {
      console.error('Failed to load masters:', error);
    }
  };

  // Task Status Master handlers
  const handleCreateTaskStatus = () => {
    setTaskStatusModalMode('create');
    setSelectedTaskStatus(null);
    setIsTaskStatusModalOpen(true);
  };

  const handleEditTaskStatus = (status: TaskStatusMaster) => {
    setTaskStatusModalMode('edit');
    setSelectedTaskStatus(status);
    setIsTaskStatusModalOpen(true);
  };

  const handleSaveTaskStatus = async (statusData: Partial<TaskStatusMaster>) => {
    try {
      if (taskStatusModalMode === 'create') {
        const maxOrder = Math.max(...taskStatusMasters.map(s => s.order), 0);
        const newStatus = await createTaskStatusMaster({
          name: statusData.name!,
          color: statusData.color!,
          order: maxOrder + 1
        });
        setTaskStatusMasters([...taskStatusMasters, newStatus]);
      } else if (taskStatusModalMode === 'edit' && selectedTaskStatus) {
        const updatedStatus = await updateTaskStatusMaster(selectedTaskStatus.id, statusData);
        setTaskStatusMasters(taskStatusMasters.map(s => s.id === selectedTaskStatus.id ? updatedStatus : s));
      }
      setIsTaskStatusModalOpen(false);
    } catch (error) {
      console.error('Failed to save task status:', error);
    }
  };

  const handleMoveTaskStatusUp = async (status: TaskStatusMaster) => {
    const currentIndex = taskStatusMasters.findIndex(s => s.id === status.id);
    if (currentIndex <= 0) return; // 最初の要素は上に移動できない

    const targetStatus = taskStatusMasters[currentIndex - 1];
    // order値を入れ替え
    await updateTaskStatusMaster(status.id, { order: targetStatus.order });
    await updateTaskStatusMaster(targetStatus.id, { order: status.order });

    // ローカルステートも更新
    const updated = await getTaskStatusMasters();
    setTaskStatusMasters(updated);
  };

  const handleMoveTaskStatusDown = async (status: TaskStatusMaster) => {
    const currentIndex = taskStatusMasters.findIndex(s => s.id === status.id);
    if (currentIndex >= taskStatusMasters.length - 1) return; // 最後の要素は下に移動できない

    const targetStatus = taskStatusMasters[currentIndex + 1];
    // order値を入れ替え
    await updateTaskStatusMaster(status.id, { order: targetStatus.order });
    await updateTaskStatusMaster(targetStatus.id, { order: status.order });

    // ローカルステートも更新
    const updated = await getTaskStatusMasters();
    setTaskStatusMasters(updated);
  };

  const handleDeleteTaskStatus = async (status: TaskStatusMaster) => {
    // 使用中かチェック（削除確認の前に）
    const isInUse = await checkMasterInUse('taskStatus', status.id);
    if (isInUse) {
      setAlertTitle('削除できません');
      setAlertMessage('このタスクステータスはプロセスフローで使用されているため削除できません。');
      setAlertType('error');
      setIsAlertModalOpen(true);
      return;
    }

    setDeleteTarget({ type: 'taskStatus', item: status });
    setIsDeleteModalOpen(true);
  };

  // Deliverable Status Master handlers
  const handleCreateDeliverableStatus = () => {
    setDeliverableStatusModalMode('create');
    setSelectedDeliverableStatus(null);
    setIsDeliverableStatusModalOpen(true);
  };

  const handleEditDeliverableStatus = (status: DeliverableStatusMaster) => {
    setDeliverableStatusModalMode('edit');
    setSelectedDeliverableStatus(status);
    setIsDeliverableStatusModalOpen(true);
  };

  const handleSaveDeliverableStatus = async (statusData: Partial<DeliverableStatusMaster>) => {
    try {
      if (deliverableStatusModalMode === 'create') {
        const maxOrder = Math.max(...deliverableStatusMasters.map(s => s.order), 0);
        const newStatus = await createDeliverableStatusMaster({
          name: statusData.name!,
          color: statusData.color!,
          order: maxOrder + 1
        });
        setDeliverableStatusMasters([...deliverableStatusMasters, newStatus]);
      } else if (deliverableStatusModalMode === 'edit' && selectedDeliverableStatus) {
        const updatedStatus = await updateDeliverableStatusMaster(selectedDeliverableStatus.id, statusData);
        setDeliverableStatusMasters(deliverableStatusMasters.map(s => s.id === selectedDeliverableStatus.id ? updatedStatus : s));
      }
      setIsDeliverableStatusModalOpen(false);
    } catch (error) {
      console.error('Failed to save deliverable status:', error);
    }
  };

  const handleMoveDeliverableStatusUp = async (status: DeliverableStatusMaster) => {
    const currentIndex = deliverableStatusMasters.findIndex(s => s.id === status.id);
    if (currentIndex <= 0) return;

    const targetStatus = deliverableStatusMasters[currentIndex - 1];
    await updateDeliverableStatusMaster(status.id, { order: targetStatus.order });
    await updateDeliverableStatusMaster(targetStatus.id, { order: status.order });

    const updated = await getDeliverableStatusMasters();
    setDeliverableStatusMasters(updated);
  };

  const handleMoveDeliverableStatusDown = async (status: DeliverableStatusMaster) => {
    const currentIndex = deliverableStatusMasters.findIndex(s => s.id === status.id);
    if (currentIndex >= deliverableStatusMasters.length - 1) return;

    const targetStatus = deliverableStatusMasters[currentIndex + 1];
    await updateDeliverableStatusMaster(status.id, { order: targetStatus.order });
    await updateDeliverableStatusMaster(targetStatus.id, { order: status.order });

    const updated = await getDeliverableStatusMasters();
    setDeliverableStatusMasters(updated);
  };

  const handleDeleteDeliverableStatus = async (status: DeliverableStatusMaster) => {
    // 使用中かチェック（削除確認の前に）
    const isInUse = await checkMasterInUse('deliverableStatus', status.id);
    if (isInUse) {
      setAlertTitle('削除できません');
      setAlertMessage('この成果物ステータスはプロセスフローで使用されているため削除できません。');
      setAlertType('error');
      setIsAlertModalOpen(true);
      return;
    }

    setDeleteTarget({ type: 'deliverableStatus', item: status });
    setIsDeleteModalOpen(true);
  };

  // Assignee Master handlers
  const handleCreateAssignee = () => {
    setAssigneeModalMode('create');
    setSelectedAssignee(null);
    setIsAssigneeModalOpen(true);
  };

  const handleEditAssignee = (assignee: AssigneeMaster) => {
    setAssigneeModalMode('edit');
    setSelectedAssignee(assignee);
    setIsAssigneeModalOpen(true);
  };

  const handleSaveAssignee = async (assigneeData: Partial<AssigneeMaster>) => {
    try {
      if (assigneeModalMode === 'create') {
        const newAssignee = await createAssigneeMaster(
          assigneeData.name!,
          assigneeData.email,
          assigneeData.role
        );
        setAssigneeMasters([...assigneeMasters, newAssignee]);
      } else if (assigneeModalMode === 'edit' && selectedAssignee) {
        const updatedAssignee = await updateAssigneeMaster(selectedAssignee.id, assigneeData);
        setAssigneeMasters(assigneeMasters.map(a => a.id === selectedAssignee.id ? updatedAssignee : a));
      }
      setIsAssigneeModalOpen(false);
    } catch (error) {
      console.error('Failed to save assignee:', error);
    }
  };

  const handleMoveAssigneeUp = async (assignee: AssigneeMaster) => {
    const currentIndex = assigneeMasters.findIndex(a => a.id === assignee.id);
    if (currentIndex <= 0) return;

    const targetAssignee = assigneeMasters[currentIndex - 1];
    await updateAssigneeMaster(assignee.id, { order: targetAssignee.order });
    await updateAssigneeMaster(targetAssignee.id, { order: assignee.order });

    const updated = await getAssigneeMasters();
    setAssigneeMasters(updated);
  };

  const handleMoveAssigneeDown = async (assignee: AssigneeMaster) => {
    const currentIndex = assigneeMasters.findIndex(a => a.id === assignee.id);
    if (currentIndex >= assigneeMasters.length - 1) return;

    const targetAssignee = assigneeMasters[currentIndex + 1];
    await updateAssigneeMaster(assignee.id, { order: targetAssignee.order });
    await updateAssigneeMaster(targetAssignee.id, { order: assignee.order });

    const updated = await getAssigneeMasters();
    setAssigneeMasters(updated);
  };

  const handleDeleteAssignee = async (assignee: AssigneeMaster) => {
    // 「未割当」(ID=1)は削除不可
    if (assignee.id === 1) {
      setAlertTitle('削除不可');
      setAlertMessage('「未割当」は削除できません。');
      setAlertType('warning');
      setIsAlertModalOpen(true);
      return;
    }

    // 使用中かチェック（削除確認の前に）
    const isInUse = await checkMasterInUse('assignee', assignee.id);
    if (isInUse) {
      setAlertTitle('削除できません');
      setAlertMessage('この担当者はプロセスフローで使用されているため削除できません。');
      setAlertType('error');
      setIsAlertModalOpen(true);
      return;
    }

    setDeleteTarget({ type: 'assignee', item: assignee });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      // 使用チェックは各handleDeleteXXX関数で実施済み
      if (deleteTarget.type === 'taskStatus') {
        await deleteTaskStatusMaster(deleteTarget.item.id);
        setTaskStatusMasters(taskStatusMasters.filter(s => s.id !== deleteTarget.item.id));
      } else if (deleteTarget.type === 'deliverableStatus') {
        await deleteDeliverableStatusMaster(deleteTarget.item.id);
        setDeliverableStatusMasters(deliverableStatusMasters.filter(s => s.id !== deleteTarget.item.id));
      } else if (deleteTarget.type === 'assignee') {
        await deleteAssigneeMaster(deleteTarget.item.id);
        setAssigneeMasters(assigneeMasters.filter(a => a.id !== deleteTarget.item.id));
      } else if (deleteTarget.type === 'deliverableType') {
        await deleteDeliverableTypeMaster(deleteTarget.item.id);
        setDeliverableTypeMasters(deliverableTypeMasters.filter(d => d.id !== deleteTarget.item.id));
      }
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Failed to delete:', error);
      setIsDeleteModalOpen(false);
      setAlertTitle('エラー');
      setAlertMessage('削除に失敗しました。');
      setAlertType('error');
      setIsAlertModalOpen(true);
    }
  };

  const checkMasterInUse = async (type: string, id: number): Promise<boolean> => {
    try {
      console.log(`[MasterManagement] Checking if ${type} ID ${id} is in use...`);
      // 全プロジェクトのタスクと成果物を取得
      const allProjects = JSON.parse(localStorage.getItem('pm_projects') || '[]');
      console.log(`[MasterManagement] Found ${allProjects.length} projects`);

      for (const project of allProjects) {
        const tasks = await getTasks(project.id);
        const deliverables = await getDeliverables(project.id);
        console.log(`[MasterManagement] Project ${project.id}: ${tasks.length} tasks, ${deliverables.length} deliverables`);

        if (type === 'taskStatus') {
          const usedInTasks = tasks.filter(t => t.status === id);
          if (usedInTasks.length > 0) {
            console.log(`[MasterManagement] TaskStatus ${id} is used in ${usedInTasks.length} tasks:`, usedInTasks.map(t => t.name));
            return true;
          }
        } else if (type === 'deliverableStatus') {
          const usedInDeliverables = deliverables.filter(d => d.status === id);
          if (usedInDeliverables.length > 0) {
            console.log(`[MasterManagement] DeliverableStatus ${id} is used in ${usedInDeliverables.length} deliverables:`, usedInDeliverables.map(d => d.name));
            return true;
          }
        } else if (type === 'assignee') {
          const usedInTasks = tasks.filter(t => t.assigned_to === id);
          if (usedInTasks.length > 0) {
            console.log(`[MasterManagement] Assignee ${id} is used in ${usedInTasks.length} tasks:`, usedInTasks.map(t => t.name));
            return true;
          }
        } else if (type === 'deliverableType') {
          const usedInDeliverables = deliverables.filter(d => d.type === id);
          if (usedInDeliverables.length > 0) {
            console.log(`[MasterManagement] DeliverableType ${id} is used in ${usedInDeliverables.length} deliverables:`, usedInDeliverables.map(d => d.name));
            return true;
          }
        }
      }

      console.log(`[MasterManagement] ${type} ID ${id} is NOT in use`);
      return false;
    } catch (error) {
      console.error('[MasterManagement] Failed to check master usage:', error);
      // エラー時は安全のためtrueを返す（削除させない）
      return true;
    }
  };

  const getItemTypeName = (type: string): string => {
    switch (type) {
      case 'taskStatus': return 'タスクステータス';
      case 'deliverableStatus': return '成果物ステータス';
      case 'assignee': return '担当者';
      case 'deliverableType': return '成果物種類';
      default: return 'マスタ';
    }
  };

  // Deliverable Type Master handlers
  const handleCreateDeliverableType = () => {
    setDeliverableTypeModalMode('create');
    setSelectedDeliverableType(null);
    setIsDeliverableTypeModalOpen(true);
  };

  const handleEditDeliverableType = (deliverableType: DeliverableTypeMaster) => {
    setDeliverableTypeModalMode('edit');
    setSelectedDeliverableType(deliverableType);
    setIsDeliverableTypeModalOpen(true);
  };

  const handleSaveDeliverableType = async (deliverableTypeData: Partial<DeliverableTypeMaster>) => {
    try {
      if (deliverableTypeModalMode === 'create') {
        const newDeliverableType = await createDeliverableTypeMaster(
          deliverableTypeData.name!,
          deliverableTypeData.icon!,
          deliverableTypeData.color!
        );
        setDeliverableTypeMasters([...deliverableTypeMasters, newDeliverableType]);
      } else if (deliverableTypeModalMode === 'edit' && selectedDeliverableType) {
        const updatedDeliverableType = await updateDeliverableTypeMaster(selectedDeliverableType.id, deliverableTypeData);
        setDeliverableTypeMasters(deliverableTypeMasters.map(d => d.id === selectedDeliverableType.id ? updatedDeliverableType : d));
      }
      setIsDeliverableTypeModalOpen(false);
    } catch (error) {
      console.error('Failed to save deliverable type:', error);
    }
  };

  const handleMoveDeliverableTypeUp = async (deliverableType: DeliverableTypeMaster) => {
    const currentIndex = deliverableTypeMasters.findIndex(d => d.id === deliverableType.id);
    if (currentIndex <= 0) return;

    const targetType = deliverableTypeMasters[currentIndex - 1];
    await updateDeliverableTypeMaster(deliverableType.id, { order: targetType.order });
    await updateDeliverableTypeMaster(targetType.id, { order: deliverableType.order });

    const updated = await getDeliverableTypeMasters();
    setDeliverableTypeMasters(updated);
  };

  const handleMoveDeliverableTypeDown = async (deliverableType: DeliverableTypeMaster) => {
    const currentIndex = deliverableTypeMasters.findIndex(d => d.id === deliverableType.id);
    if (currentIndex >= deliverableTypeMasters.length - 1) return;

    const targetType = deliverableTypeMasters[currentIndex + 1];
    await updateDeliverableTypeMaster(deliverableType.id, { order: targetType.order });
    await updateDeliverableTypeMaster(targetType.id, { order: deliverableType.order });

    const updated = await getDeliverableTypeMasters();
    setDeliverableTypeMasters(updated);
  };

  const handleDeleteDeliverableType = async (deliverableType: DeliverableTypeMaster) => {
    // 使用中かチェック（削除確認の前に）
    const isInUse = await checkMasterInUse('deliverableType', deliverableType.id);
    if (isInUse) {
      setAlertTitle('削除できません');
      setAlertMessage('この成果物種類はプロセスフローで使用されているため削除できません。');
      setAlertType('error');
      setIsAlertModalOpen(true);
      return;
    }

    setDeleteTarget({ type: 'deliverableType', item: deliverableType });
    setIsDeleteModalOpen(true);
  };

  const tabs = [
    { id: 'taskStatus' as MasterType, label: 'タスクステータス', icon: MdTask },
    { id: 'deliverableStatus' as MasterType, label: '成果物ステータス', icon: MdWork },
    { id: 'assignee' as MasterType, label: '担当者', icon: MdPerson },
    { id: 'deliverableType' as MasterType, label: '成果物種類', icon: MdInventory },
  ];

  const renderTaskStatusMasters = () => (
    <div className="master-section">
      <div className="master-section-header">
        <h4>タスクステータス管理</h4>
        <button onClick={handleCreateTaskStatus} className="btn-primary">
          タスクステータス追加
        </button>
      </div>

      <div className="master-list">
        {taskStatusMasters.map((status, index) => (
          <div key={status.id} className="master-item">
            <div className="master-item-content">
              <div
                className="status-color"
                style={{ backgroundColor: status.color }}
              ></div>
              <span>{status.name}</span>
            </div>
            <div className="master-item-actions">
              <button onClick={() => handleMoveTaskStatusUp(status)} className="btn-icon" disabled={index === 0} title="上に移動"><MdArrowUpward size={20} style={{color: index === 0 ? '#9ca3af' : '#6b7280'}} /></button>
              <button onClick={() => handleMoveTaskStatusDown(status)} className="btn-icon" disabled={index === taskStatusMasters.length - 1} title="下に移動"><MdArrowDownward size={20} style={{color: index === taskStatusMasters.length - 1 ? '#9ca3af' : '#6b7280'}} /></button>
              <button onClick={() => handleEditTaskStatus(status)} className="btn-icon" title="編集"><MdEdit size={20} style={{color: '#3b82f6'}} /></button>
              <button onClick={() => handleDeleteTaskStatus(status)} className="btn-icon delete" title="削除"><MdDelete size={20} style={{color: '#ef4444'}} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDeliverableStatusMasters = () => (
    <div className="master-section">
      <div className="master-section-header">
        <h4>成果物ステータス管理</h4>
        <button onClick={handleCreateDeliverableStatus} className="btn-primary">
          成果物ステータス追加
        </button>
      </div>

      <div className="master-list">
        {deliverableStatusMasters.map((status, index) => (
          <div key={status.id} className="master-item">
            <div className="master-item-content">
              <div
                className="status-color"
                style={{ backgroundColor: status.color }}
              ></div>
              <span>{status.name}</span>
            </div>
            <div className="master-item-actions">
              <button onClick={() => handleMoveDeliverableStatusUp(status)} className="btn-icon" disabled={index === 0} title="上に移動"><MdArrowUpward size={20} style={{color: index === 0 ? '#9ca3af' : '#6b7280'}} /></button>
              <button onClick={() => handleMoveDeliverableStatusDown(status)} className="btn-icon" disabled={index === deliverableStatusMasters.length - 1} title="下に移動"><MdArrowDownward size={20} style={{color: index === deliverableStatusMasters.length - 1 ? '#9ca3af' : '#6b7280'}} /></button>
              <button onClick={() => handleEditDeliverableStatus(status)} className="btn-icon" title="編集"><MdEdit size={20} style={{color: '#3b82f6'}} /></button>
              <button onClick={() => handleDeleteDeliverableStatus(status)} className="btn-icon delete" title="削除"><MdDelete size={20} style={{color: '#ef4444'}} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAssigneeMasters = () => (
    <div className="master-section">
      <div className="master-section-header">
        <h4>担当者管理</h4>
        <button onClick={handleCreateAssignee} className="btn-primary">
          担当者追加
        </button>
      </div>
      
      <div className="master-list">
        {assigneeMasters.map((assignee, index) => (
          <div key={assignee.id} className="master-item">
            <div className="master-item-content">
              <div className="assignee-info">
                <span className="assignee-name">{assignee.name}</span>
                {assignee.email && <span className="assignee-email">{assignee.email}</span>}
                {assignee.role && <span className="assignee-role">{assignee.role}</span>}
              </div>
            </div>
            {assignee.id === 1 ? (
              // 「未割当」(ID=1)の場合はボタンを表示しない
              <div className="master-item-actions"></div>
            ) : (
              <div className="master-item-actions">
                <button onClick={() => handleMoveAssigneeUp(assignee)} className="btn-icon" disabled={index === 0} title="上に移動"><MdArrowUpward size={20} style={{color: index === 0 ? '#9ca3af' : '#6b7280'}} /></button>
                <button onClick={() => handleMoveAssigneeDown(assignee)} className="btn-icon" disabled={index === assigneeMasters.length - 1} title="下に移動"><MdArrowDownward size={20} style={{color: index === assigneeMasters.length - 1 ? '#9ca3af' : '#6b7280'}} /></button>
                <button onClick={() => handleEditAssignee(assignee)} className="btn-icon" title="編集"><MdEdit size={20} style={{color: '#3b82f6'}} /></button>
                <button onClick={() => handleDeleteAssignee(assignee)} className="btn-icon delete" title="削除"><MdDelete size={20} style={{color: '#ef4444'}} /></button>
              </div>
            )}
          </div>
        ))}
        {assigneeMasters.length === 0 && (
          <div className="empty-state">
            <p>担当者が登録されていません</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDeliverableTypeMasters = () => (
    <div className="master-section">
      <div className="master-section-header">
        <h4>成果物種類管理</h4>
        <button onClick={handleCreateDeliverableType} className="btn-primary">
          種類追加
        </button>
      </div>
      
      <div className="master-list">
        {deliverableTypeMasters.map((deliverableType, index) => (
          <div key={deliverableType.id} className="master-item">
            <div className="master-item-content">
              <span className="type-icon">{renderIcon(deliverableType.icon, 24)}</span>
              <span className="type-name">{deliverableType.name}</span>
              <div
                className="type-color"
                style={{ backgroundColor: deliverableType.color }}
              ></div>
            </div>
            <div className="master-item-actions">
              <button onClick={() => handleMoveDeliverableTypeUp(deliverableType)} className="btn-icon" disabled={index === 0} title="上に移動"><MdArrowUpward size={20} style={{color: index === 0 ? '#9ca3af' : '#6b7280'}} /></button>
              <button onClick={() => handleMoveDeliverableTypeDown(deliverableType)} className="btn-icon" disabled={index === deliverableTypeMasters.length - 1} title="下に移動"><MdArrowDownward size={20} style={{color: index === deliverableTypeMasters.length - 1 ? '#9ca3af' : '#6b7280'}} /></button>
              <button onClick={() => handleEditDeliverableType(deliverableType)} className="btn-icon" title="編集"><MdEdit size={20} style={{color: '#3b82f6'}} /></button>
              <button onClick={() => handleDeleteDeliverableType(deliverableType)} className="btn-icon delete" title="削除"><MdDelete size={20} style={{color: '#ef4444'}} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'taskStatus':
        return renderTaskStatusMasters();
      case 'deliverableStatus':
        return renderDeliverableStatusMasters();
      case 'assignee':
        return renderAssigneeMasters();
      case 'deliverableType':
        return renderDeliverableTypeMasters();
      default:
        return renderTaskStatusMasters();
    }
  };

  return (
    <div className="master-management">
      <div className="master-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`master-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="tab-icon" size={22} />
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="master-content">
        {renderContent()}
      </div>

      {/* Task Status Master Modal */}
      <TaskStatusMasterModal
        isOpen={isTaskStatusModalOpen}
        onClose={() => setIsTaskStatusModalOpen(false)}
        onSave={handleSaveTaskStatus}
        status={selectedTaskStatus}
        mode={taskStatusModalMode}
      />

      {/* Deliverable Status Master Modal */}
      <DeliverableStatusMasterModal
        isOpen={isDeliverableStatusModalOpen}
        onClose={() => setIsDeliverableStatusModalOpen(false)}
        onSave={handleSaveDeliverableStatus}
        status={selectedDeliverableStatus}
        mode={deliverableStatusModalMode}
      />

      {/* Assignee Master Modal */}
      <AssigneeMasterModal
        isOpen={isAssigneeModalOpen}
        onClose={() => setIsAssigneeModalOpen(false)}
        onSave={handleSaveAssignee}
        assignee={selectedAssignee}
        mode={assigneeModalMode}
      />

      {/* Deliverable Type Master Modal */}
      <DeliverableTypeMasterModal
        isOpen={isDeliverableTypeModalOpen}
        onClose={() => setIsDeliverableTypeModalOpen(false)}
        onSave={handleSaveDeliverableType}
        deliverableType={selectedDeliverableType}
        mode={deliverableTypeModalMode}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={deleteTarget?.item.name || ''}
        itemType={
          deleteTarget?.type === 'taskStatus' ? 'タスクステータス' :
          deleteTarget?.type === 'deliverableStatus' ? '成果物ステータス' :
          deleteTarget?.type === 'assignee' ? '担当者' :
          '成果物種類'
        }
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
      />
    </div>
  );
}