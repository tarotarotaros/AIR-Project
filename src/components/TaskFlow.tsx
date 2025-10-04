import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Task, Project } from '../types';
import { getTasks, createTask, updateTask, updateTaskPosition, deleteTask } from '../services/mockDatabase';
import TaskModal from './TaskModal';
import CustomTaskNode from './CustomTaskNode';

interface TaskFlowProps {
  project: Project | null;
}

const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'not_started': return '#f3f4f6';
    case 'in_progress': return '#fef3c7';
    case 'completed': return '#d1fae5';
    case 'blocked': return '#fee2e2';
    default: return '#f3f4f6';
  }
};

const getPriorityBorder = (priority: Task['priority']) => {
  switch (priority) {
    case 'low': return '2px solid #10b981';
    case 'medium': return '2px solid #f59e0b';
    case 'high': return '2px solid #ef4444';
    case 'critical': return '3px solid #dc2626';
    default: return '2px solid #6b7280';
  }
};

// カスタムノードタイプの定義
const nodeTypes = {
  customTask: CustomTaskNode,
};

export default function TaskFlow({ project }: TaskFlowProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (project) {
      loadTasks();
    } else {
      setTasks([]);
      setNodes([]);
      setEdges([]);
    }
  }, [project]);

  useEffect(() => {
    if (tasks.length > 0) {
      const taskNodes: Node[] = tasks.map((task, index) => ({
        id: task.id.toString(),
        type: 'customTask',
        position: { 
          x: task.position_x || (150 + index * 250), 
          y: task.position_y || 100 
        },
        data: {
          task,
          onEdit: handleEditTask,
        },
      }));
      setNodes(taskNodes);
    }
  }, [tasks, setNodes]);

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

  const loadTasks = async () => {
    if (!project) return;
    
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
    if (!project) return;

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

  const onNodeDragStop = useCallback(async (event: any, node: Node) => {
    try {
      await updateTaskPosition(parseInt(node.id), node.position.x, node.position.y);
    } catch (error) {
      console.error('Failed to update task position:', error);
    }
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#2563eb',
        },
        style: {
          strokeWidth: 2,
          stroke: '#2563eb',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  if (!project) {
    return (
      <div className="task-flow-empty">
        <p>プロジェクトを選択してください</p>
      </div>
    );
  }

  return (
    <div className="task-flow">
      <div className="task-flow-header">
        <h2>{project.name} - タスクフロー</h2>
        <button onClick={handleCreateTask}>タスク追加</button>
      </div>

      <div className="react-flow-container" style={{ height: '500px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          fitView
          connectionLineStyle={{ strokeWidth: 2, stroke: '#2563eb' }}
          defaultEdgeOptions={{
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#2563eb',
            },
            style: {
              strokeWidth: 2,
              stroke: '#2563eb',
            },
          }}
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
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