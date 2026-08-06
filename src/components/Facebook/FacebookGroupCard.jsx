import PrimaryButton from "../Common/PrimaryButton";
import SectionCard from "../Common/SectionCard";
import { getCurrentPosting } from "../../services/postingSessionService";

function FacebookGroupCard({
  group,
  onEdit,
  onDelete,
}) {

  const postingCar = getCurrentPosting();

  return (
    <SectionCard title={`👥 ${group.name}`}>

      <p>⭐ Rating: {group.rating}/5</p>

      <p>🟢 Trạng thái: {group.status}</p>

      <p>📌 Đã đăng: {group.totalPosts}</p>

      <p>👤 Lead: {group.leads || 0}</p>

      <p>💰 Xe bán: {group.soldCars || 0}</p>

      <p>
        🚗 Dòng xe:{" "}
        {group.suitableCars.length > 0
          ? group.suitableCars.join(", ")
          : "Chưa có"}
      </p>

      <br />

      {postingCar?.aiContent?.facebook && (
        <PrimaryButton
          onClick={() => {
            navigator.clipboard.writeText(
              postingCar.aiContent.facebook
            );
            alert("✅ Đã copy bài Facebook.");
          }}
          style={{
            background: "#1976d2",
            marginRight: 10,
          }}
        >
          📋 Copy AI
        </PrimaryButton>
      )}

      {group.url && (
        <PrimaryButton
          onClick={() =>
            window.open(group.url, "_blank")
          }
          style={{
            marginRight: 10,
          }}
        >
          🌐 Mở nhóm
        </PrimaryButton>
      )}

      <PrimaryButton
        onClick={() =>
          alert("✅ Đã đánh dấu đã đăng.")
        }
        style={{
          background: "#2e7d32",
          marginRight: 10,
        }}
      >
        ✅ Đã đăng
      </PrimaryButton>

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