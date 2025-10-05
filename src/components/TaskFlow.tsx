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
import { toPng } from 'html-to-image';
import 'reactflow/dist/style.css';
import { MdList, MdInventory, MdFileDownload, MdFileUpload, MdPictureAsPdf, MdCheckCircle, MdError, MdHourglassEmpty, MdAutoAwesome } from 'react-icons/md';
import dagre from 'dagre';
import { Task, Project, Deliverable, FlowConnection, AssigneeMaster } from '../types';
import {
  getTasks, createTask, updateTask, updateTaskPosition, deleteTask,
  getDeliverables, createDeliverable, updateDeliverable, updateDeliverablePosition, deleteDeliverable,
  getConnections, createConnection, deleteConnection, deleteConnectionsByNodeId,
  getAssigneeMasters
} from '../services/databaseAdapter';
import TaskModal from './TaskModal';
import DeliverableModal from './DeliverableModal';
import CustomTaskNode from './CustomTaskNode';
import CustomDeliverableNode from './CustomDeliverableNode';
import CustomEdge from './CustomEdge';
import PDFExportModal, { PDFExportSettings } from './PDFExportModal';
import jsPDF from 'jspdf';

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
  const [assignees, setAssignees] = useState<AssigneeMaster[]>([]);

  // Task modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Deliverable modal state
  const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState(false);
  const [deliverableModalMode, setDeliverableModalMode] = useState<'create' | 'edit'>('create');
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);

  // PDF export modal state
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);

  // PDF progress modal state
  const [isPDFProgressModalOpen, setIsPDFProgressModalOpen] = useState(false);
  const [pdfProgressMessage, setPdfProgressMessage] = useState('PDF出力中...');

  useEffect(() => {
    if (project) {
      loadTasks();
      loadDeliverables();
      loadConnections();
      loadAssignees();
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

    setNodes((currentNodes) => {
      const allNodes: Node[] = [];

      // 現在のノード位置をマップに保存
      const currentPositions = new Map<string, { x: number; y: number }>();
      currentNodes.forEach(node => {
        currentPositions.set(node.id, node.position);
      });

      // タスクノードを追加
      tasks.forEach((task, index) => {
        const nodeId = `task-${task.id}`;
        // 既存ノードの位置を優先、なければデータベースの位置、それもなければ自動配置
        let position;
        if (currentPositions.has(nodeId)) {
          position = currentPositions.get(nodeId)!;
        } else if (task.position_x !== null && task.position_x !== undefined) {
          position = { x: task.position_x, y: task.position_y! };
        } else {
          position = { x: 150 + allNodes.filter(n => n.type === 'customTask').length * 250, y: 100 };
        }

        allNodes.push({
          id: nodeId,
          type: 'customTask',
          position,
          data: {
            task,
            assignees,
            onEdit: handleEditTask,
            onDelete: handleDeleteTask,
          },
          connectable: true,
          draggable: true,
        });
      });

      // 成果物ノードを追加
      deliverables.forEach((deliverable, index) => {
        const nodeId = `deliverable-${deliverable.id}`;
        // 既存ノードの位置を優先、なければデータベースの位置、それもなければ自動配置
        let position;
        if (currentPositions.has(nodeId)) {
          position = currentPositions.get(nodeId)!;
        } else if (deliverable.position_x !== null && deliverable.position_x !== undefined) {
          position = { x: deliverable.position_x, y: deliverable.position_y! };
        } else {
          position = { x: 150 + allNodes.filter(n => n.type === 'customDeliverable').length * 250, y: 300 };
        }

        allNodes.push({
          id: nodeId,
          type: 'customDeliverable',
          position,
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
      return allNodes;
    });
  }, [tasks, deliverables, assignees]);

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

  const loadAssignees = async () => {
    try {
      const assigneesData = await getAssigneeMasters();
      setAssignees(assigneesData);
    } catch (error) {
      console.error('Failed to load assignees:', error);
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

  const handleAutoLayout = async () => {
    if (!project) return;

    try {
      // dagreグラフの作成
      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));

      // 左から右へのレイアウト（横方向）
      dagreGraph.setGraph({ rankdir: 'LR', nodesep: 100, ranksep: 150 });

      // ノードの幅と高さを設定
      const nodeWidth = 200;
      const nodeHeight = 100;

      // ノードを登録
      nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
      });

      // エッジを登録
      edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
      });

      // レイアウト計算
      dagre.layout(dagreGraph);

      // 計算された位置を適用
      const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
          ...node,
          position: {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
          },
        };
      });

      // 画面に反映
      setNodes(layoutedNodes);

      // データベースに保存
      for (const node of layoutedNodes) {
        const nodeData = node.data;
        if (node.type === 'customTask') {
          await updateTaskPosition(parseInt(node.id.replace('task-', '')), node.position.x, node.position.y);
        } else if (node.type === 'customDeliverable') {
          await updateDeliverablePosition(parseInt(node.id.replace('deliverable-', '')), node.position.x, node.position.y);
        }
      }

      console.log('Auto layout completed');
    } catch (error) {
      console.error('Auto layout error:', error);
      alert('自動整列に失敗しました。');
    }
  };

  const handlePDFExport = async (settings: PDFExportSettings) => {
    if (!project) return;

    try {
      // 進捗モーダルを表示
      setIsPDFModalOpen(false);
      setIsPDFProgressModalOpen(true);
      setPdfProgressMessage('PDF出力中...');

      console.log('Starting PDF export...');

      // React FlowのtoPng関数を使用（エッジも含めて正確にキャプチャ）
      const dataUrl = await toPng(document.querySelector('.react-flow') as HTMLElement, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        filter: (node) => {
          // 背景ドットを除外
          if (node.classList?.contains('react-flow__background')) {
            return false;
          }
          // コントロールパネルを除外
          if (node.classList?.contains('react-flow__controls')) {
            return false;
          }
          return true;
        },
      });

      console.log('Image created with toPng');

      // 画像を読み込んでサイズを取得
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });

      console.log('Image loaded:', img.width, 'x', img.height);

      // 用紙サイズの設定（mm単位）
      const pageSizes = {
        A4: { width: 210, height: 297 },
        A3: { width: 297, height: 420 },
        B5: { width: 182, height: 257 },
        B4: { width: 257, height: 364 },
      };

      const pageSize = pageSizes[settings.pageSize];
      const orientation = settings.orientation;

      // PDFの作成
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: [pageSize.width, pageSize.height],
      });

      const pdfWidth = orientation === 'portrait' ? pageSize.width : pageSize.height;
      const pdfHeight = orientation === 'portrait' ? pageSize.height : pageSize.width;

      // ヘッダー・フッター用のマージン
      const headerHeight = 20;
      const footerHeight = 10;
      const margin = 10;
      const contentAreaHeight = pdfHeight - headerHeight - footerHeight - margin * 2;

      // ヘッダー: プロジェクト名（中央揃え）- Canvasで日本語描画
      const headerCanvas = document.createElement('canvas');
      headerCanvas.width = (pdfWidth - margin * 2) * 10; // 高解像度
      headerCanvas.height = 100;
      const headerCtx = headerCanvas.getContext('2d')!;
      headerCtx.font = 'bold 48px sans-serif';
      headerCtx.fillStyle = '#000000';
      headerCtx.textAlign = 'center';
      headerCtx.fillText(project.name, headerCanvas.width / 2, 70);
      const headerDataUrl = headerCanvas.toDataURL('image/png');
      pdf.addImage(headerDataUrl, 'PNG', margin, margin, pdfWidth - margin * 2, 15);

      // 画像のアスペクト比を維持しながらPDFに収める
      const imgWidth = img.width;
      const imgHeight = img.height;
      const ratio = Math.min((pdfWidth - margin * 2) / imgWidth, contentAreaHeight / imgHeight);
      const width = imgWidth * ratio;
      const height = imgHeight * ratio;

      console.log('PDF dimensions:', width, 'x', height);

      // 画像を配置（ヘッダーの下）
      pdf.addImage(dataUrl, 'PNG', margin, margin + headerHeight, width, height);

      // フッター: 出力日時（右揃え）- Canvasで日本語描画
      const now = new Date();
      const dateTimeStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const footerCanvas = document.createElement('canvas');
      footerCanvas.width = (pdfWidth - margin * 2) * 10;
      footerCanvas.height = 60;
      const footerCtx = footerCanvas.getContext('2d')!;
      footerCtx.font = '32px sans-serif';
      footerCtx.fillStyle = '#000000';
      footerCtx.textAlign = 'right';
      footerCtx.fillText(dateTimeStr, footerCanvas.width - 10, 40);
      const footerDataUrl = footerCanvas.toDataURL('image/png');
      pdf.addImage(footerDataUrl, 'PNG', margin, pdfHeight - footerHeight, pdfWidth - margin * 2, 8);

      // PDFを保存
      pdf.save(`${project.name}_flow.pdf`);
      console.log('PDF saved');

      // 完了メッセージを表示
      setPdfProgressMessage('PDF出力が完了しました');
      setTimeout(() => {
        setIsPDFProgressModalOpen(false);
      }, 1500);
    } catch (error) {
      console.error('PDF export error:', error);
      setPdfProgressMessage('PDF出力に失敗しました');
      setTimeout(() => {
        setIsPDFProgressModalOpen(false);
      }, 2000);
    }
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
        <button onClick={handleAutoLayout} className="btn-secondary">
          <MdAutoAwesome size={20} />
          自動整列
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
          <button onClick={() => setIsPDFModalOpen(true)} className="btn-secondary">
            <MdPictureAsPdf size={20} />
            PDF出力
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

      <PDFExportModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        onExport={handlePDFExport}
      />

      {/* PDF出力進捗モーダル */}
      {isPDFProgressModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>{pdfProgressMessage}</h2>
            {pdfProgressMessage === 'PDF出力中...' && (
              <MdHourglassEmpty size={48} style={{ color: '#6b7280' }} />
            )}
            {pdfProgressMessage === 'PDF出力が完了しました' && (
              <MdCheckCircle size={48} style={{ color: '#10b981' }} />
            )}
            {pdfProgressMessage === 'PDF出力に失敗しました' && (
              <MdError size={48} style={{ color: '#ef4444' }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}