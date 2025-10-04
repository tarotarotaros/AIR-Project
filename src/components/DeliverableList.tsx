import { useState, useEffect } from 'react';
import { Project, Deliverable } from '../types';
import { getDeliverables, createDeliverable, updateDeliverable, deleteDeliverable } from '../services/mockDatabase';
import DeliverableModal from './DeliverableModal';

interface DeliverableListProps {
  project: Project;
}

export default function DeliverableList({ project }: DeliverableListProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'type' | 'due_date' | 'created_at'>('created_at');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  useEffect(() => {
    loadDeliverables();
  }, [project]);

  const loadDeliverables = async () => {
    try {
      const deliverablesData = await getDeliverables(project.id);
      setDeliverables(deliverablesData);
    } catch (error) {
      console.error('Failed to load deliverables:', error);
    }
  };

  const handleCreateDeliverable = () => {
    setModalMode('create');
    setSelectedDeliverable(null);
    setIsModalOpen(true);
  };

  const handleEditDeliverable = (deliverable: Deliverable) => {
    setModalMode('edit');
    setSelectedDeliverable(deliverable);
    setIsModalOpen(true);
  };

  const handleSaveDeliverable = async (deliverableData: Partial<Deliverable>) => {
    try {
      if (modalMode === 'create') {
        const newDeliverable = await createDeliverable(
          project.id,
          deliverableData.name!,
          deliverableData.description,
          deliverableData.type,
          deliverableData.due_date
        );
        setDeliverables([...deliverables, newDeliverable]);
      } else if (modalMode === 'edit' && selectedDeliverable) {
        const updatedDeliverable = await updateDeliverable(selectedDeliverable.id, deliverableData);
        setDeliverables(deliverables.map(d => d.id === selectedDeliverable.id ? updatedDeliverable : d));
      }
    } catch (error) {
      console.error('Failed to save deliverable:', error);
    }
  };

  const handleDeleteDeliverable = async (deliverable: Deliverable) => {
    if (confirm(`成果物 "${deliverable.name}" を削除しますか？`)) {
      try {
        await deleteDeliverable(deliverable.id);
        setDeliverables(deliverables.filter(d => d.id !== deliverable.id));
      } catch (error) {
        console.error('Failed to delete deliverable:', error);
      }
    }
  };

  const getStatusLabel = (status: Deliverable['status']) => {
    switch (status) {
      case 'not_ready': return '準備中';
      case 'ready': return '準備完了';
      case 'completed': return '完成';
      default: return status;
    }
  };

  const getTypeLabel = (type: Deliverable['type']) => {
    switch (type) {
      case 'document': return 'ドキュメント';
      case 'software': return 'ソフトウェア';
      case 'design': return '設計書';
      case 'data': return 'データ';
      case 'other': return 'その他';
      default: return type;
    }
  };

  const getTypeIcon = (type: Deliverable['type']) => {
    switch (type) {
      case 'document': return '📄';
      case 'software': return '💻';
      case 'design': return '🎨';
      case 'data': return '📊';
      case 'other': return '📦';
      default: return '📦';
    }
  };

  const getStatusColor = (status: Deliverable['status']) => {
    switch (status) {
      case 'not_ready': return '#fef3c7';
      case 'ready': return '#dbeafe';
      case 'completed': return '#d1fae5';
      default: return '#f3f4f6';
    }
  };

  const isOverdue = (deliverable: Deliverable) => {
    if (!deliverable.due_date) return false;
    return new Date(deliverable.due_date) < new Date() && deliverable.status !== 'completed';
  };

  // Filter and sort deliverables
  const filteredAndSortedDeliverables = deliverables
    .filter(deliverable => {
      if (filterStatus !== 'all' && deliverable.status !== filterStatus) return false;
      if (filterType !== 'all' && deliverable.type !== filterType) return false;
      if (searchQuery && !deliverable.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="deliverable-list">
      <div className="deliverable-list-header">
        <h3>成果物一覧</h3>
        <button onClick={handleCreateDeliverable} className="btn-primary">
          成果物追加
        </button>
      </div>

      <div className="deliverable-list-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="成果物名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">全てのステータス</option>
            <option value="not_ready">準備中</option>
            <option value="ready">準備完了</option>
            <option value="completed">完成</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">全ての種類</option>
            <option value="document">ドキュメント</option>
            <option value="software">ソフトウェア</option>
            <option value="design">設計書</option>
            <option value="data">データ</option>
            <option value="other">その他</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="created_at">作成日時順</option>
            <option value="name">名前順</option>
            <option value="status">ステータス順</option>
            <option value="type">種類順</option>
            <option value="due_date">期限日順</option>
          </select>
        </div>

        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
            onClick={() => setViewMode('card')}
            title="カード表示"
          >
            ⊞
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="リスト表示"
          >
            ☰
          </button>
        </div>
      </div>

      <div className="deliverable-list-content">
        {filteredAndSortedDeliverables.length === 0 ? (
          <div className="empty-state">
            <p>成果物がありません</p>
          </div>
        ) : viewMode === 'card' ? (
          <div className="deliverable-grid">
            {filteredAndSortedDeliverables.map((deliverable) => (
              <div 
                key={deliverable.id} 
                className={`deliverable-card ${isOverdue(deliverable) ? 'overdue' : ''}`}
              >
                <div className="deliverable-card-header">
                  <div className="deliverable-title">
                    <span className="type-icon">{getTypeIcon(deliverable.type)}</span>
                    <h4>{deliverable.name}</h4>
                  </div>
                  <div className="deliverable-actions">
                    <button
                      onClick={() => handleEditDeliverable(deliverable)}
                      className="btn-icon"
                      title="編集"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteDeliverable(deliverable)}
                      className="btn-icon delete"
                      title="削除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {deliverable.description && (
                  <p className="deliverable-description">{deliverable.description}</p>
                )}
                
                <div className="deliverable-metadata">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(deliverable.status) }}
                  >
                    {getStatusLabel(deliverable.status)}
                  </span>
                  <span className="type-badge">
                    {getTypeLabel(deliverable.type)}
                  </span>
                </div>
                
                {deliverable.due_date && (
                  <div className={`deliverable-due-date ${isOverdue(deliverable) ? 'overdue' : ''}`}>
                    期限: {new Date(deliverable.due_date).toLocaleDateString('ja-JP')}
                    {isOverdue(deliverable) && <span className="overdue-label">期限切れ</span>}
                  </div>
                )}
                
                <div className="deliverable-dates">
                  <small>作成: {new Date(deliverable.created_at).toLocaleDateString('ja-JP')}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="deliverable-table">
            <div className="deliverable-table-header">
              <div className="deliverable-table-cell">成果物名</div>
              <div className="deliverable-table-cell">ステータス</div>
              <div className="deliverable-table-cell">種類</div>
              <div className="deliverable-table-cell">期限</div>
              <div className="deliverable-table-cell">作成日</div>
              <div className="deliverable-table-cell">操作</div>
            </div>
            {filteredAndSortedDeliverables.map((deliverable) => (
              <div key={deliverable.id} className={`deliverable-table-row ${isOverdue(deliverable) ? 'overdue' : ''}`}>
                <div className="deliverable-table-cell">
                  <div className="deliverable-name-with-icon">
                    <span className="type-icon">{getTypeIcon(deliverable.type)}</span>
                    <div className="deliverable-name">{deliverable.name}</div>
                  </div>
                  {deliverable.description && (
                    <div className="deliverable-description-list">{deliverable.description}</div>
                  )}
                </div>
                <div className="deliverable-table-cell">
                  <span
                    className="status-badge-list"
                    style={{ backgroundColor: getStatusColor(deliverable.status) }}
                  >
                    {getStatusLabel(deliverable.status)}
                  </span>
                </div>
                <div className="deliverable-table-cell">
                  <span className="type-badge-list">
                    {getTypeLabel(deliverable.type)}
                  </span>
                </div>
                <div className="deliverable-table-cell">
                  {deliverable.due_date ? (
                    <div className={isOverdue(deliverable) ? 'overdue-text' : ''}>
                      {new Date(deliverable.due_date).toLocaleDateString('ja-JP')}
                      {isOverdue(deliverable) && <div className="overdue-label-small">期限切れ</div>}
                    </div>
                  ) : '-'}
                </div>
                <div className="deliverable-table-cell">
                  {new Date(deliverable.created_at).toLocaleDateString('ja-JP')}
                </div>
                <div className="deliverable-table-cell">
                  <div className="deliverable-actions-list">
                    <button
                      onClick={() => handleEditDeliverable(deliverable)}
                      className="btn-icon"
                      title="編集"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteDeliverable(deliverable)}
                      className="btn-icon delete"
                      title="削除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeliverableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDeliverable}
        deliverable={selectedDeliverable}
        mode={modalMode}
      />
    </div>
  );
}