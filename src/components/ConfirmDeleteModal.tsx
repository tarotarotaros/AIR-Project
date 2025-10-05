import { MdWarning } from 'react-icons/md';
import Modal from './Modal';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType
}: ConfirmDeleteModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="削除確認">
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <MdWarning size={48} color="#ef4444" style={{ marginRight: '1rem', flexShrink: 0 }} />
          <div>
            <p style={{ marginBottom: '1rem', fontSize: '1.2rem', lineHeight: '1.6' }}>
              {itemType} <strong>「{itemName}」</strong> を削除してもよろしいですか？
            </p>
            <p style={{ margin: 0, fontSize: '1.1rem', color: '#ef4444' }}>
              この操作は取り消せません。
            </p>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn-secondary">
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="btn-primary"
            style={{ backgroundColor: '#ef4444' }}
          >
            削除
          </button>
        </div>
      </div>
    </Modal>
  );
}
