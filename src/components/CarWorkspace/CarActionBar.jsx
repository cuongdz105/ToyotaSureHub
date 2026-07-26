import "./CarActionBar.css";

function CarActionBar({
  onBack,
  onEdit,
  onDelete,
  onAI,
}) {
  return (
    <div className="action-bar">
      <button className="btn-back" onClick={onBack}>
        ⬅ Quay lại
      </button>

      <button className="btn-edit" onClick={onEdit}>
        ✏️ Sửa
      </button>

      <button className="btn-delete" onClick={onDelete}>
        🗑 Xóa
      </button>

      <button className="btn-ai" onClick={onAI}>
        🤖 Toyota AI
      </button>
    </div>
  );
}

export default CarActionBar;