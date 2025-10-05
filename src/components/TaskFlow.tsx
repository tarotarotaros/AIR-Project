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
import { MdList, MdInventory, MdFileDownload, MdFileUpload } from 'react-icons/md';
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
import CustomEdge from './CustomEdge';

// nodeTypesをコンポーネント外で定義（重要！）
const nodeTypes = {
  customTask: CustomTaskNode,
  customDeliverable: CustomDeliverableNode,
};

const edgeTypes = {
  custom: CustomEdge,
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
    console.log('Updating nodes. Tasks:', tasks.length, 'Deliverables:', deliverables.length);
    console.log('Tasks:', tasks);
    console.log('Deliverables:', deliverables);

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

    console.log('Generated nodes:', allNodes.length);
    setNodes(allNodes);
  }, [tasks, deliverables, setNodes]);

  useEffect(() => {
    // 接続データからReact Flowのエッジを生成
    const allEdges = connections.map(connection => ({
      id: `connection-${connection.id}`,
      source: `${connection.source_type}-${connection.source_id}`,
      target: `${connection.target_type}-${connection.target_id}`,
      type: 'custom',
      animated: false,
      selectable: true,
      focusable: true,
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
    console.log('handleSaveTask called with:', taskData);
    if (!project) return;

    try {
      if (taskModalMode === 'create') {
        console.log('Creating new task...');
        const newTask = await createTask({
          project_id: project.id,
          name: taskData.name!,
          description: taskData.description || '',
          status: taskData.status || 'not_started',
          priority: taskData.priority || 'medium',
          start_date: taskData.start_date,
          end_date: taskData.end_date,
          duration_days: taskData.duration_days,
        });
        console.log('New task created:', newTask);
        await loadTasks(); // データベースから再読み込み
      } else if (taskModalMode === 'edit' && selectedTask) {
        console.log('Updating task...');
        await updateTask(selectedTask.id, taskData);
        await loadTasks(); // データベースから再読み込み
      }
      setIsTaskModalOpen(false);
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
    console.log('handleSaveDeliverable called with:', deliverableData);
    if (!project) return;

    try {
      if (deliverableModalMode === 'create') {
        console.log('Creating new deliverable...');
        const newDeliverable = await createDeliverable({
          project_id: project.id,
          name: deliverableData.name!,
          description: deliverableData.description || '',
          type: deliverableData.type || 'other',
          status: deliverableData.status || 'not_ready',
          due_date: deliverableData.due_date,
        });
        console.log('New deliverable created:', newDeliverable);
        await loadDeliverables(); // データベースから再読み込み
      } else if (deliverableModalMode === 'edit' && selectedDeliverable) {
        console.log('Updating deliverable...');
        await updateDeliverable(selectedDeliverable.id, deliverableData);
        await loadDeliverables(); // データベースから再読み込み
      }
      setIsDeliverableModalOpen(false);
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

  const onNodesDelete = useCallback(
    async (nodesToDelete: Node[]) => {
      try {
        for (const node of nodesToDelete) {
          if (node.id.startsWith('task-')) {
            const taskId = parseInt(node.id.replace('task-', ''));
            const task = tasks.find(t => t.id === taskId);
            if (task) {
              await deleteTask(taskId);
              await deleteConnectionsByNodeId('task', taskId);
            }
          } else if (node.id.startsWith('deliverable-')) {
            const deliverableId = parseInt(node.id.replace('deliverable-', ''));
            const deliverable = deliverables.find(d => d.id === deliverableId);
            if (deliverable) {
              await deleteDeliverable(deliverableId);
              await deleteConnectionsByNodeId('deliverable', deliverableId);
            }
          }
        }
        loadTasks();
        loadDeliverables();
        loadConnections();
      } catch (error) {
        console.error('Failed to delete nodes:', error);
      }
    },
    [tasks, deliverables]
  );

  if (!project) {
    return (
      <div className="task-flow-empty">
        <p>プロジェクトを選択してください</p>
      </div>
    );
  }

  const handleExport = () => {
    if (!project) return;

    console.log('Exporting connections:', connections);
    connections.forEach((conn, index) => {
      console.log(`Connection ${index}:`, conn);
    });

    // マーメイド記法のフロー図を生成
    let mermaidGraph = 'graph LR\n';

    // タスクノードを追加
    tasks.forEach(task => {
      const statusLabel = getStatusLabel(task.status);
      const priorityLabel = getPriorityLabel(task.priority);
      mermaidGraph += `    task_${task.id}[${task.name}<br/>${statusLabel} | ${priorityLabel}]\n`;
    });

    // 成果物ノードを追加
    deliverables.forEach(deliverable => {
      const statusLabel = deliverable.status === 'not_ready' ? '準備中' :
                          deliverable.status === 'ready' ? '準備完了' : '完成';
      mermaidGraph += `    deliverable_${deliverable.id}{${deliverable.name}<br/>${statusLabel}}\n`;
    });

    mermaidGraph += '\n';

    // 接続を追加（有効な接続のみ）
    connections.forEach(connection => {
      if (connection.source_type && connection.target_type) {
        mermaidGraph += `    ${connection.source_type}_${connection.source_id} --> ${connection.target_type}_${connection.target_id}\n`;
      }
    });

    // JSONデータを生成（有効な接続のみ）
    const validConnections = connections
      .filter(conn => conn.source_type && conn.target_type)
      .map(conn => ({
        source_type: conn.source_type,
        source_id: conn.source_id,
        target_type: conn.target_type,
        target_id: conn.target_id,
      }));

    console.log('Valid connections for export:', validConnections);

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        created_at: project.created_at,
      },
      tasks: tasks,
      deliverables: deliverables,
      connections: validConnections,
    };

    // Markdownファイルを生成
    const markdown = `# ${project.name}

## プロセスフロー図

\`\`\`mermaid
${mermaidGraph}\`\`\`

## プロジェクト詳細データ

\`\`\`json
${JSON.stringify(exportData, null, 2)}
\`\`\`
`;

    // ファイルをダウンロード
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_flow.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();

      // JSONデータを抽出
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        alert('不正なファイル形式です。JSONデータが見つかりません。');
        return;
      }

      try {
        const importData = JSON.parse(jsonMatch[1]);

        // バージョンチェック
        if (importData.version !== '1.0') {
          alert('サポートされていないバージョンです。');
          return;
        }

        // データをインポート（IDマッピングを保持）
        console.log('Importing data:', importData);

        // IDマッピング用のMap
        const taskIdMap = new Map<number, number>(); // 旧ID -> 新ID
        const deliverableIdMap = new Map<number, number>(); // 旧ID -> 新ID

        // タスクをインポート
        for (const task of importData.tasks) {
          const newTask = await createTask({
            project_id: project!.id,
            name: task.name,
            description: task.description || '',
            status: task.status || 'not_started',
            priority: task.priority || 'medium',
            start_date: task.start_date,
            end_date: task.end_date,
            duration_days: task.duration_days,
            position_x: task.position_x,
            position_y: task.position_y,
          });
          taskIdMap.set(task.id, newTask.id);
        }

        // 成果物をインポート
        for (const deliverable of importData.deliverables) {
          const newDeliverable = await createDeliverable({
            project_id: project!.id,
            name: deliverable.name,
            description: deliverable.description || '',
            type: deliverable.type || 'other',
            status: deliverable.status || 'not_ready',
            due_date: deliverable.due_date,
            position_x: deliverable.position_x,
            position_y: deliverable.position_y,
          });
          deliverableIdMap.set(deliverable.id, newDeliverable.id);
        }

        // データを再読み込み
        await loadTasks();
        await loadDeliverables();

        // 接続をインポート
        console.log('Importing connections:', importData.connections);
        console.log('Task ID map:', taskIdMap);
        console.log('Deliverable ID map:', deliverableIdMap);

        for (const connection of importData.connections) {
          // 空のオブジェクトをスキップ
          if (!connection.source_type || !connection.target_type) {
            console.warn('Skipping invalid connection:', connection);
            continue;
          }

          console.log('Processing connection:', connection);

          const sourceId = connection.source_type === 'task'
            ? taskIdMap.get(connection.source_id)
            : deliverableIdMap.get(connection.source_id);

          const targetId = connection.target_type === 'task'
            ? taskIdMap.get(connection.target_id)
            : deliverableIdMap.get(connection.target_id);

          console.log(`Mapped IDs: source ${connection.source_id} -> ${sourceId}, target ${connection.target_id} -> ${targetId}`);

          if (sourceId && targetId) {
            console.log('Creating connection...');
            await createConnection({
              project_id: project!.id,
              source_type: connection.source_type,
              source_id: sourceId,
              target_type: connection.target_type,
              target_id: targetId,
            });
          } else {
            console.warn('Skipping connection due to missing IDs');
          }
        }

        // 接続を再読み込み
        await loadConnections();
        console.log('Connections after import:', connections);

        alert('インポートが完了しました。');

      } catch (error) {
        console.error('Import error:', error);
        alert('インポートに失敗しました。ファイル形式を確認してください。');
      }
    };
    input.click();
  };

  return (
    <div className="task-flow">
      <div className="flow-controls">
        <button onClick={handleCreateTask} className="btn-secondary">
          <MdList size={20} />
          タスク追加
        </button>
        <button onClick={handleCreateDeliverable} className="btn-secondary">
          <MdInventory size={20} />
          成果物追加
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleImport} className="btn-secondary">
            <MdFileUpload size={20} />
            インポート
          </button>
          <button onClick={handleExport} className="btn-secondary">
            <MdFileDownload size={20} />
            エクスポート
          </button>
        </div>
      </div>

      <div className="react-flow-container" style={{ height: '500px' }}>
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            <marker
              id="arrow-default"
              viewBox="-10 -10 20 20"
              refX="0"
              refY="0"
              markerWidth="12.5"
              markerHeight="12.5"
              orient="auto"
            >
              <polyline
                stroke="#2563eb"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                fill="#2563eb"
                points="-5,-4 0,0 -5,4 -5,-4"
              />
            </marker>
            <marker
              id="arrow-selected"
              viewBox="-10 -10 20 20"
              refX="0"
              refY="0"
              markerWidth="12.5"
              markerHeight="12.5"
              orient="auto"
            >
              <polyline
                stroke="#ef4444"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                fill="#ef4444"
                points="-5,-4 0,0 -5,4 -5,-4"
              />
            </marker>
          </defs>
        </svg>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          fitView
          connectOnClick={false}
          connectionMode="strict"
          edgesFocusable={true}
          elementsSelectable={true}
          selectionOnDrag={true}
          panOnDrag={true}
          selectionMode="partial"
          selectionKeyCode="Shift"
          multiSelectionKeyCode="Shift"
          deleteKeyCode="Delete"
          connectionLineStyle={{ strokeWidth: 2, stroke: '#2563eb' }}
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