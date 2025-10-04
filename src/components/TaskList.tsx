import { useState, useEffect } from 'react';
import { MdEdit, MdDelete, MdViewModule, MdViewList } from 'react-icons/md';
import { Project, Task } from '../types';
import { getTasks, createTask, updateTask, deleteTask } from '../services/databaseAdapter';
import TaskModal from './TaskModal';

interface TaskListProps {
  project: Project;
}

export default function TaskList({ project }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'priority' | 'created_at'>('created_at');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  useEffect(() => {
    loadTasks();
  }, [project]);

  const loadTasks = async () => {
    try {
      const tasksData = await getTasks(project.id);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const handleCreateTask = () => {
    setModalMode('create');
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setModalMode('edit');
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (modalMode === 'create') {
        const newTask = await createTask(
          project.id,
          taskData.name!,
          taskData.description,
          taskData.status,
          taskData.priority
        );
        setTasks([...tasks, newTask]);
      } else if (modalMode === 'edit' && selectedTask) {
        const updatedTask = await updateTask(selectedTask.id, taskData);
        setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (confirm(`タスク "${task.name}" を削除しますか？`)) {
      try {
        await deleteTask(task.id);
        setTasks(tasks.filter(t => t.id !== task.id));
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'not_started': return '未開始';
      case 'in_progress': return '進行中';
      case 'completed': return '完了';
      case 'blocked': return 'ブロック';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return '低';
      case 'medium': return '中';
      case 'high': return '高';
      case 'critical': return '緊急';
      default: return priority;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'not_started': return '#f3f4f6';
      case 'in_progress': return '#fef3c7';
      case 'completed': return '#d1fae5';
      case 'blocked': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (searchQuery && !task.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h3>タスク一覧</h3>
        <button onClick={handleCreateTask} className="btn-primary">
          タスク追加
        </button>
      </div>

      <div className="task-list-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="タスク名で検索..."
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
            <option value="not_started">未開始</option>
            <option value="in_progress">進行中</option>
            <option value="completed">完了</option>
            <option value="blocked">ブロック</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="created_at">作成日時順</option>
            <option value="name">名前順</option>
            <option value="status">ステータス順</option>
            <option value="priority">優先度順</option>
          </select>
        </div>

        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
            onClick={() => setViewMode('card')}
            title="カード表示"
          >
            <MdViewModule size={20} />
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="リスト表示"
          >
            <MdViewList size={20} />
          </button>
        </div>
      </div>

      <div className="task-list-content">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="empty-state">
            <p>タスクがありません</p>
          </div>
        ) : viewMode === 'card' ? (
          <div className="task-grid">
            {filteredAndSortedTasks.map((task) => (
              <div key={task.id} className="task-card">
                <div className="task-card-header">
                  <h4>{task.name}</h4>
                  <div className="task-actions">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="btn-icon"
                      title="編集"
                    >
                      <MdEdit size={24} style={{color: '#3b82f6'}} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task)}
                      className="btn-icon delete"
                      title="削除"
                    >
                      <MdDelete size={24} style={{color: '#ef4444'}} />
                    </button>
                  </div>
                </div>
                
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
                
                <div className="task-metadata">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(task.status) }}
                  >
                    {getStatusLabel(task.status)}
                  </span>
                  <span
                    className="priority-badge"
                    style={{ color: getPriorityColor(task.priority) }}
                  >
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>
                
                {task.duration_days && (
                  <div className="task-duration">
                    期間: {task.duration_days}日
                  </div>
                )}
                
                <div className="task-dates">
                  <small>作成: {new Date(task.created_at).toLocaleDateString('ja-JP')}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="task-table">
            <div className="task-table-header">
              <div className="task-table-cell">タスク名</div>
              <div className="task-table-cell">ステータス</div>
              <div className="task-table-cell">優先度</div>
              <div className="task-table-cell">期間</div>
              <div className="task-table-cell">作成日</div>
              <div className="task-table-cell">操作</div>
            </div>
            {filteredAndSortedTasks.map((task) => (
              <div key={task.id} className="task-table-row">
                <div className="task-table-cell">
                  <div className="task-name">{task.name}</div>
                  {task.description && (
                    <div className="task-description-list">{task.description}</div>
                  )}
                </div>
                <div className="task-table-cell">
                  <span
                    className="status-badge-list"
                    style={{ backgroundColor: getStatusColor(task.status) }}
                  >
                    {getStatusLabel(task.status)}
                  </span>
                </div>
                <div className="task-table-cell">
                  <span
                    className="priority-badge-list"
                    style={{ color: getPriorityColor(task.priority) }}
                  >
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>
                <div className="task-table-cell">
                  {task.duration_days ? `${task.duration_days}日` : '-'}
                </div>
                <div className="task-table-cell">
                  {new Date(task.created_at).toLocaleDateString('ja-JP')}
                </div>
                <div className="task-table-cell">
                  <div className="task-actions-list">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="btn-icon"
                      title="編集"
                    >
                      <MdEdit size={24} style={{color: '#3b82f6'}} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task)}
                      className="btn-icon delete"
                      title="削除"
                    >
                      <MdDelete size={24} style={{color: '#ef4444'}} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={selectedTask}
        mode={modalMode}
      />
    </div>
  );
}