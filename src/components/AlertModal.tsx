import { MdInfo, MdWarning, MdError } from 'react-icons/md';
import Modal from './Modal';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error';
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info'
}: AlertModalProps) {
  const getIconColor = () => {
    switch (type) {
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  const getIcon = () => {
    const iconProps = { size: 48, color: getIconColor() };
    switch (type) {
      case 'warning': return <MdWarning {...iconProps} />;
      case 'error': return <MdError {...iconProps} />;
      default: return <MdInfo {...iconProps} />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ marginRight: '1rem', display: 'flex', alignItems: 'center' }}>
            {getIcon()}
          </div>
          <p style={{ fontSize: '1.2rem', margin: 0, lineHeight: '1.6' }}>{message}</p>
        </div>
        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn-primary">
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
}
