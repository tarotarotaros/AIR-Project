import {
  MdDescription, MdComputer, MdDesignServices, MdBarChart, MdInventory,
  MdSettings, MdBuild, MdChecklist, MdTrendingUp, MdTrendingDown,
  MdTrackChanges, MdLightbulb, MdSearch, MdFolder, MdFolderOpen,
  MdNote, MdCode, MdDataObject, MdStorage, MdCloud
} from 'react-icons/md';

// アイコン名とコンポーネントのマッピング
export const iconMap: { [key: string]: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }> } = {
  'MdDescription': MdDescription,
  'MdComputer': MdComputer,
  'MdDesignServices': MdDesignServices,
  'MdBarChart': MdBarChart,
  'MdInventory': MdInventory,
  'MdSettings': MdSettings,
  'MdBuild': MdBuild,
  'MdChecklist': MdChecklist,
  'MdTrendingUp': MdTrendingUp,
  'MdTrendingDown': MdTrendingDown,
  'MdTrackChanges': MdTrackChanges,
  'MdLightbulb': MdLightbulb,
  'MdSearch': MdSearch,
  'MdFolder': MdFolder,
  'MdFolderOpen': MdFolderOpen,
  'MdNote': MdNote,
  'MdCode': MdCode,
  'MdDataObject': MdDataObject,
  'MdStorage': MdStorage,
  'MdCloud': MdCloud,
};

// アイコン名からReact-Iconsコンポーネントを取得
export function getIconComponent(iconName: string): React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }> {
  return iconMap[iconName] || MdInventory;
}

// アイコン名からReact-Iconsコンポーネントを描画
export function renderIcon(iconName: string, size: number = 24, color?: string, style?: React.CSSProperties): JSX.Element {
  const IconComponent = getIconComponent(iconName);
  return <IconComponent size={size} color={color} style={style} />;
}
