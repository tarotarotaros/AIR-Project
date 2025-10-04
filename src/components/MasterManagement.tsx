import { useState, useEffect } from 'react';
import { StatusMaster, AssigneeMaster, DeliverableTypeMaster } from '../types';
import {
  getStatusMasters, createStatusMaster, updateStatusMaster, deleteStatusMaster,
  getAssigneeMasters, createAssigneeMaster, updateAssigneeMaster, deleteAssigneeMaster,
  getDeliverableTypeMasters, createDeliverableTypeMaster, updateDeliverableTypeMaster, deleteDeliverableTypeMaster
} from '../services/mockDatabase';
import StatusMasterModal from './StatusMasterModal';
import AssigneeMasterModal from './AssigneeMasterModal';
import DeliverableTypeMasterModal from './DeliverableTypeMasterModal';

type MasterType = 'status' | 'assignee' | 'deliverableType';

export default function MasterManagement() {
  const [activeTab, setActiveTab] = useState<MasterType>('status');
  
  // Status Masters
  const [statusMasters, setStatusMasters] = useState<StatusMaster[]>([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState<'create' | 'edit'>('create');
  const [selectedStatus, setSelectedStatus] = useState<StatusMaster | null>(null);
  
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

  useEffect(() => {
    loadAllMasters();
  }, []);

  const loadAllMasters = async () => {
    try {
      const [statusData, assigneeData, deliverableTypeData] = await Promise.all([
        getStatusMasters(),
        getAssigneeMasters(),
        getDeliverableTypeMasters()
      ]);
      setStatusMasters(statusData);
      setAssigneeMasters(assigneeData);
      setDeliverableTypeMasters(deliverableTypeData);
    } catch (error) {
      console.error('Failed to load masters:', error);
    }
  };

  // Status Master handlers
  const handleCreateStatus = () => {
    setStatusModalMode('create');
    setSelectedStatus(null);
    setIsStatusModalOpen(true);
  };

  const handleEditStatus = (status: StatusMaster) => {
    setStatusModalMode('edit');
    setSelectedStatus(status);
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = async (statusData: Partial<StatusMaster>) => {
    try {
      if (statusModalMode === 'create') {
        const newStatus = await createStatusMaster(
          statusData.name!,
          statusData.type!,
          statusData.color!
        );
        setStatusMasters([...statusMasters, newStatus]);
      } else if (statusModalMode === 'edit' && selectedStatus) {
        const updatedStatus = await updateStatusMaster(selectedStatus.id, statusData);
        setStatusMasters(statusMasters.map(s => s.id === selectedStatus.id ? updatedStatus : s));
      }
    } catch (error) {
      console.error('Failed to save status:', error);
    }
  };

  const handleDeleteStatus = async (status: StatusMaster) => {
    if (confirm(`ステータス "${status.name}" を削除しますか？`)) {
      try {
        await deleteStatusMaster(status.id);
        setStatusMasters(statusMasters.filter(s => s.id !== status.id));
      } catch (error) {
        console.error('Failed to delete status:', error);
      }
    }
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
    } catch (error) {
      console.error('Failed to save assignee:', error);
    }
  };

  const handleDeleteAssignee = async (assignee: AssigneeMaster) => {
    if (confirm(`担当者 "${assignee.name}" を削除しますか？`)) {
      try {
        await deleteAssigneeMaster(assignee.id);
        setAssigneeMasters(assigneeMasters.filter(a => a.id !== assignee.id));
      } catch (error) {
        console.error('Failed to delete assignee:', error);
      }
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
    } catch (error) {
      console.error('Failed to save deliverable type:', error);
    }
  };

  const handleDeleteDeliverableType = async (deliverableType: DeliverableTypeMaster) => {
    if (confirm(`成果物種類 "${deliverableType.name}" を削除しますか？`)) {
      try {
        await deleteDeliverableTypeMaster(deliverableType.id);
        setDeliverableTypeMasters(deliverableTypeMasters.filter(d => d.id !== deliverableType.id));
      } catch (error) {
        console.error('Failed to delete deliverable type:', error);
      }
    }
  };

  const tabs = [
    { id: 'status' as MasterType, label: 'ステータス', icon: '🏷️' },
    { id: 'assignee' as MasterType, label: '担当者', icon: '👤' },
    { id: 'deliverableType' as MasterType, label: '成果物種類', icon: '📦' },
  ];

  const renderStatusMasters = () => (
    <div className="master-section">
      <div className="master-section-header">
        <h4>ステータス管理</h4>
        <button onClick={handleCreateStatus} className="btn-primary">
          ステータス追加
        </button>
      </div>
      
      <div className="master-categories">
        <div className="master-category">
          <h5>タスクステータス</h5>
          <div className="master-list">
            {statusMasters.filter(s => s.type === 'task').map((status) => (
              <div key={status.id} className="master-item">
                <div className="master-item-content">
                  <div 
                    className="status-color" 
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span>{status.name}</span>
                </div>
                <div className="master-item-actions">
                  <button onClick={() => handleEditStatus(status)} className="btn-icon">✏️</button>
                  <button onClick={() => handleDeleteStatus(status)} className="btn-icon delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="master-category">
          <h5>成果物ステータス</h5>
          <div className="master-list">
            {statusMasters.filter(s => s.type === 'deliverable').map((status) => (
              <div key={status.id} className="master-item">
                <div className="master-item-content">
                  <div 
                    className="status-color" 
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span>{status.name}</span>
                </div>
                <div className="master-item-actions">
                  <button onClick={() => handleEditStatus(status)} className="btn-icon">✏️</button>
                  <button onClick={() => handleDeleteStatus(status)} className="btn-icon delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
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
        {assigneeMasters.map((assignee) => (
          <div key={assignee.id} className="master-item">
            <div className="master-item-content">
              <div className="assignee-info">
                <span className="assignee-name">{assignee.name}</span>
                {assignee.email && <span className="assignee-email">{assignee.email}</span>}
                {assignee.role && <span className="assignee-role">{assignee.role}</span>}
              </div>
            </div>
            <div className="master-item-actions">
              <button onClick={() => handleEditAssignee(assignee)} className="btn-icon">✏️</button>
              <button onClick={() => handleDeleteAssignee(assignee)} className="btn-icon delete">🗑️</button>
            </div>
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
        {deliverableTypeMasters.map((deliverableType) => (
          <div key={deliverableType.id} className="master-item">
            <div className="master-item-content">
              <span className="type-icon">{deliverableType.icon}</span>
              <span className="type-name">{deliverableType.name}</span>
              <div 
                className="type-color" 
                style={{ backgroundColor: deliverableType.color }}
              ></div>
            </div>
            <div className="master-item-actions">
              <button onClick={() => handleEditDeliverableType(deliverableType)} className="btn-icon">✏️</button>
              <button onClick={() => handleDeleteDeliverableType(deliverableType)} className="btn-icon delete">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'status':
        return renderStatusMasters();
      case 'assignee':
        return renderAssigneeMasters();
      case 'deliverableType':
        return renderDeliverableTypeMasters();
      default:
        return renderStatusMasters();
    }
  };

  return (
    <div className="master-management">
      <div className="master-management-header">
        <h3>マスタ管理</h3>
      </div>

      <div className="master-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`master-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="master-content">
        {renderContent()}
      </div>

      {/* Status Master Modal */}
      <StatusMasterModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSave={handleSaveStatus}
        status={selectedStatus}
        mode={statusModalMode}
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
    </div>
  );
}