import { useState } from 'react';
import { MdAccountTree, MdList, MdInventory, MdSettings, MdManageAccounts } from 'react-icons/md';
import { Project, TabType } from '../types';
import TaskFlow from './TaskFlow';
import TaskList from './TaskList';
import DeliverableList from './DeliverableList';
import MasterManagement from './MasterManagement';
import ProjectSettings from './ProjectSettings';

interface ProjectTabsProps {
  project: Project | null;
  onProjectUpdate?: (updatedProject: Project) => void;
  onProjectDelete?: () => void;
}

export default function ProjectTabs({ project, onProjectUpdate, onProjectDelete }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('flow');
  const [tabKey, setTabKey] = useState(0);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setTabKey(prev => prev + 1); // タブ切り替え時にkeyを更新して再マウント
  };

  if (!project) {
    return (
      <div className="project-tabs-empty">
        <p>プロジェクトを選択してください</p>
      </div>
    );
  }

  const tabs = [
    { id: 'flow' as TabType, label: 'プロセスフロー', icon: MdAccountTree },
    { id: 'tasks' as TabType, label: 'タスク', icon: MdList },
    { id: 'deliverables' as TabType, label: '成果物', icon: MdInventory },
    { id: 'masters' as TabType, label: 'マスタ', icon: MdSettings },
    { id: 'settings' as TabType, label: 'プロジェクト', icon: MdManageAccounts },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'flow':
        return <TaskFlow key={`flow-${tabKey}`} project={project} />;
      case 'tasks':
        return <TaskList key={`tasks-${tabKey}`} project={project} />;
      case 'deliverables':
        return <DeliverableList key={`deliverables-${tabKey}`} project={project} />;
      case 'masters':
        return <MasterManagement key={`masters-${tabKey}`} />;
      case 'settings':
        return <ProjectSettings key={`settings-${tabKey}`} project={project} onProjectUpdate={onProjectUpdate} onProjectDelete={onProjectDelete} />;
      default:
        return <TaskFlow key={`flow-${tabKey}`} project={project} />;
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
              onClick={() => handleTabChange(tab.id)}
            >
              <tab.icon className="tab-icon" size={24} />
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