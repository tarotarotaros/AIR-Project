import { useState, useEffect } from 'react';
import Modal from './Modal';

interface PDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (settings: PDFExportSettings) => void;
}

export interface PDFExportSettings {
  pageSize: 'A4' | 'A3' | 'B5' | 'B4';
  orientation: 'portrait' | 'landscape';
}

export default function PDFExportModal({ isOpen, onClose, onExport }: PDFExportModalProps) {
  const [settings, setSettings] = useState<PDFExportSettings>({
    pageSize: 'A4',
    orientation: 'portrait',
  });

  useEffect(() => {
    if (isOpen) {
      setSettings({
        pageSize: 'A4',
        orientation: 'portrait',
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExport(settings);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="PDF出力設定"
    >
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="page-size">用紙サイズ</label>
          <select
            id="page-size"
            value={settings.pageSize}
            onChange={(e) => setSettings({ ...settings, pageSize: e.target.value as PDFExportSettings['pageSize'] })}
          >
            <option value="A4">A4</option>
            <option value="A3">A3</option>
            <option value="B5">B5</option>
            <option value="B4">B4</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="orientation">用紙方向</label>
          <select
            id="orientation"
            value={settings.orientation}
            onChange={(e) => setSettings({ ...settings, orientation: e.target.value as PDFExportSettings['orientation'] })}
          >
            <option value="portrait">縦</option>
            <option value="landscape">横</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            キャンセル
          </button>
          <button type="submit" className="btn-primary">
            出力
          </button>
        </div>
      </form>
    </Modal>
  );
}
