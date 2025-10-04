import { useState } from 'react';
import { Project, TabType } from '../types';
import TaskFlow from './TaskFlow';
import TaskList from './TaskList';
import DeliverableList from './DeliverableList';
import MasterManagement from './MasterManagement';

interface ProjectTabsProps {
  project: Project | null;
}

export default function ProjectTabs({ project }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('flow');

  if (!project) {
    return (
      <div className="project-tabs-empty">
        <p>プロジェクトを選択してください</p>
      </div>
    );
  }

  const tabs = [
    { id: 'flow' as TabType, label: 'フロー図', icon: '🔄' },
    { id: 'tasks' as TabType, label: 'タスク一覧', icon: '📋' },
    { id: 'deliverables' as TabType, label: '成果物一覧', icon: '📦' },
    { id: 'masters' as TabType, label: 'マスタ管理', icon: '⚙️' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'flow':
        return <TaskFlow project={project} />;
      case 'tasks':
        return <TaskList project={project} />;
      case 'deliverables':
        return <DeliverableList project={project} />;
      case 'masters':
        return <MasterManagement />;
      default:
        return <TaskFlow project={project} />;
    }
  };

  return (
    <div className="project-tabs">
      <div className="project-tabs-header">
        <h2>{project.name}</h2>
        <div className="tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="project-tabs-content">
        {renderContent()}
      </div>
    </div>
  );
}