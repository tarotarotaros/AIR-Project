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
import { Task, Project, Deliverable, FlowConnection } from '../types';
import { 
  getTasks, createTask, updateTask, updateTaskPosition, deleteTask,
  getDeliverables, createDeliverable, updateDeliverable, updateDeliverablePosition, deleteDeliverable,
  getConnections, createConnection, deleteConnection, deleteConnectionsByNodeId
} from '../services/databaseAdapter';
import TaskModal from './TaskModal';
import DeliverableModal from './DeliverableModal';
import CustomTaskNode from './CustomTaskNode';
import CustomDeliverableNode from './CustomDeliverableNode';

// nodeTypesをコンポーネント外で定義（重要！）
const nodeTypes = {
  customTask: CustomTaskNode,
  customDeliverable: CustomDeliverableNode,
};

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

export default function TaskFlow({ project }: TaskFlowProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [connections, setConnections] = useState<FlowConnection[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Task modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Deliverable modal state
  const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState(false);
  const [deliverableModalMode, setDeliverableModalMode] = useState<'create' | 'edit'>('create');
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);

  useEffect(() => {
    if (project) {
      loadTasks();
      loadDeliverables();
      loadConnections();
    } else {
      setTasks([]);
      setDeliverables([]);
      setConnections([]);
      setNodes([]);
      setEdges([]);
    }
  }, [project]);

  useEffect(() => {
    const allNodes: Node[] = [];
    
    // タスクノードを追加
    tasks.forEach((task, index) => {
      allNodes.push({
        id: `task-${task.id}`,
        type: 'customTask',
        position: { 
          x: task.position_x || (150 + index * 250), 
          y: task.position_y || 100 
        },
        data: {
          task,
          onEdit: handleEditTask,
          onDelete: handleDeleteTask,
        },
        connectable: true,
        draggable: true,
      });
    });
    
    // 成果物ノードを追加
    deliverables.forEach((deliverable, index) => {
      allNodes.push({
        id: `deliverable-${deliverable.id}`,
        type: 'customDeliverable',
        position: { 
          x: deliverable.position_x || (150 + index * 250), 
          y: deliverable.position_y || 300 
        },
        data: {
          deliverable,
          onEdit: handleEditDeliverable,
          onDelete: handleDeleteDeliverable,
        },
        connectable: true,
        draggable: true,
      });
    });
    
    setNodes(allNodes);
  }, [tasks, deliverables, setNodes]);

  useEffect(() => {
    // 接続データからReact Flowのエッジを生成
    const allEdges = connections.map(connection => ({
      id: `connection-${connection.id}`,
      source: `${connection.source_type}-${connection.source_id}`,
      target: `${connection.target_type}-${connection.target_id}`,
      type: 'default',
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
      animated: false,
      data: { connectionId: connection.id },
    }));

    setEdges(allEdges);
  }, [connections, setEdges]);

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

  const loadDeliverables = async () => {
    if (!project) return;
    
    try {
      const deliverablesData = await getDeliverables(project.id);
      setDeliverables(deliverablesData);
    } catch (error) {
      console.error('Failed to load deliverables:', error);
    }
  };

  const loadConnections = async () => {
    if (!project) return;
    
    try {
      const connectionsData = await getConnections(project.id);
      setConnections(connectionsData);
    } catch (error) {
      console.error('Failed to load connections:', error);
    }
  };

  // Task handlers
  const handleCreateTask = () => {
    setTaskModalMode('create');
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskModalMode('edit');
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (!project) return;

    try {
      if (taskModalMode === 'create') {
        const newTask = await createTask(
          project.id,
          taskData.name!,
          taskData.description,
          taskData.status,
          taskData.priority
        );
        setTasks([...tasks, newTask]);
      } else if (taskModalMode === 'edit' && selectedTask) {
        const updatedTask = await updateTask(selectedTask.id, taskData);
        setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  // Deliverable handlers
  const handleCreateDeliverable = () => {
    setDeliverableModalMode('create');
    setSelectedDeliverable(null);
    setIsDeliverableModalOpen(true);
  };

  const handleEditDeliverable = (deliverable: Deliverable) => {
    setDeliverableModalMode('edit');
    setSelectedDeliverable(deliverable);
    setIsDeliverableModalOpen(true);
  };

  const handleSaveDeliverable = async (deliverableData: Partial<Deliverable>) => {
    if (!project) return;

    try {
      if (deliverableModalMode === 'create') {
        const newDeliverable = await createDeliverable(
          project.id,
          deliverableData.name!,
          deliverableData.description,
          deliverableData.type,
          deliverableData.due_date
        );
        setDeliverables([...deliverables, newDeliverable]);
      } else if (deliverableModalMode === 'edit' && selectedDeliverable) {
        const updatedDeliverable = await updateDeliverable(selectedDeliverable.id, deliverableData);
        setDeliverables(deliverables.map(d => d.id === selectedDeliverable.id ? updatedDeliverable : d));
      }
    } catch (error) {
      console.error('Failed to save deliverable:', error);
    }
  };

  // Delete handlers
  const handleDeleteTask = async (task: Task) => {
    try {
      await deleteTask(task.id);
      await deleteConnectionsByNodeId('task', task.id);
      setTasks(tasks.filter(t => t.id !== task.id));
      loadConnections(); // 接続を再読み込み
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleDeleteDeliverable = async (deliverable: Deliverable) => {
    try {
      await deleteDeliverable(deliverable.id);
      await deleteConnectionsByNodeId('deliverable', deliverable.id);
      setDeliverables(deliverables.filter(d => d.id !== deliverable.id));
      loadConnections(); // 接続を再読み込み
    } catch (error) {
      console.error('Failed to delete deliverable:', error);
    }
  };

  const onNodeDragStop = useCallback(async (event: any, node: Node) => {
    try {
      if (node.id.startsWith('task-')) {
        const taskId = parseInt(node.id.replace('task-', ''));
        await updateTaskPosition(taskId, node.position.x, node.position.y);
      } else if (node.id.startsWith('deliverable-')) {
        const deliverableId = parseInt(node.id.replace('deliverable-', ''));
        await updateDeliverablePosition(deliverableId, node.position.x, node.position.y);
      }
    } catch (error) {
      console.error('Failed to update position:', error);
    }
  }, []);

  const onConnect = useCallback(
    async (params: Connection) => {
      if (!project || !params.source || !params.target) {
        return;
      }

      // ソースとターゲットのタイプとIDを抽出
      const [sourceType, sourceIdStr] = params.source.split('-');
      const [targetType, targetIdStr] = params.target.split('-');
      const sourceId = parseInt(sourceIdStr);
      const targetId = parseInt(targetIdStr);

      if (!sourceType || !targetType || isNaN(sourceId) || isNaN(targetId)) {
        return;
      }

      try {
        // データベースに接続を保存
        const newConnection = await createConnection({
          project_id: project.id,
          source_type: sourceType as 'task' | 'deliverable',
          source_id: sourceId,
          target_type: targetType as 'task' | 'deliverable',
          target_id: targetId
        });

        // ステートを直接更新
        setConnections(prev => [...prev, newConnection]);
      } catch (error) {
        console.error('Failed to create connection:', error);
      }
    },
    [project, connections]
  );

  const onEdgesDelete = useCallback(
    async (edgesToDelete: Edge[]) => {
      try {
        for (const edge of edgesToDelete) {
          if (edge.data?.connectionId) {
            await deleteConnection(edge.data.connectionId);
          }
        }
        loadConnections();
      } catch (error) {
        console.error('Failed to delete connections:', error);
      }
    },
    [loadConnections]
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
        <h2>{project.name} - タスク・成果物フロー</h2>
        <div className="flow-actions">
          <button onClick={handleCreateTask} className="btn-primary">タスク追加</button>
          <button onClick={handleCreateDeliverable} className="btn-secondary">成果物追加</button>
        </div>
      </div>

      <div className="react-flow-container" style={{ height: '500px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgesDelete={onEdgesDelete}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          fitView
          connectOnClick={false}
          connectionMode="strict"
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
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={selectedTask}
        mode={taskModalMode}
      />

      <DeliverableModal
        isOpen={isDeliverableModalOpen}
        onClose={() => setIsDeliverableModalOpen(false)}
        onSave={handleSaveDeliverable}
        deliverable={selectedDeliverable}
        mode={deliverableModalMode}
      />
    </div>
  );
}