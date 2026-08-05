import PrimaryButton from "../Common/PrimaryButton";
import SectionCard from "../Common/SectionCard";

function FacebookGroupCard({
  group,
  onEdit,
  onDelete,
}) {
  return (
    <SectionCard title={`👥 ${group.name}`}>

      <p>⭐ Rating: {group.rating}/5</p>

      <p>🟢 Trạng thái: {group.status}</p>

      <p>📌 Đã đăng: {group.totalPosts}</p>

      <p>👤 Lead: {group.leads || 0}</p>

      <p>💰 Xe bán: {group.soldCars || 0}</p>

      <p>
        🚗 Dòng xe:
        {" "}
        {group.suitableCars.length > 0
          ? group.suitableCars.join(", ")
          : "Chưa có"}
      </p>

      <br />

      {group.url && (
        <PrimaryButton
          onClick={() =>
            window.open(group.url, "_blank")
          }
          style={{ marginRight: 10 }}
        >
          🌐 Mở nhóm
        </PrimaryButton>
      )}

      <PrimaryButton
        onClick={() => onEdit(group)}
        style={{
          background: "#ff9800",
          marginRight: 10,
        }}
      >
        ✏️ Sửa
      </PrimaryButton>

      <PrimaryButton
        onClick={() => onDelete(group.id)}
        style={{
          background: "#e53935",
        }}
      >
        🗑️ Xóa
      </PrimaryButton>

    </SectionCard>
  );
}

export default FacebookGroupCard;