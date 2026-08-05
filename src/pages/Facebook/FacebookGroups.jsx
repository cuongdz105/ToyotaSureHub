import { useEffect, useState } from "react";
import {
  loadGroups,
  addGroup,
} from "../../services/facebookGroupService";

function FacebookGroups() {
  const [groups, setGroups] = useState([]);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    refreshGroups();
  }, []);

  function refreshGroups() {
    setGroups(loadGroups());
  }

  function handleAddGroup() {
    if (!name.trim()) {
      alert("Vui lòng nhập tên nhóm.");
      return;
    }

    addGroup({
      name,
      url,
    });

    setName("");
    setUrl("");

    refreshGroups();
  }

  return (
    <div className="content">
      <h1>👥 Facebook Groups</h1>

      <p>Quản lý toàn bộ hội nhóm Facebook.</p>

      <hr />

      <h3>➕ Thêm hội nhóm</h3>

      <input
        type="text"
        placeholder="Tên hội nhóm"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Link hội nhóm (không bắt buộc)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleAddGroup}>
        💾 Lưu hội nhóm
      </button>

      <hr />

      <h3>📋 Danh sách hội nhóm</h3>

      {groups.length === 0 ? (
        <p>Chưa có hội nhóm nào.</p>
      ) : (
        groups.map((group) => (
          <div
            key={group.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <h3>👥 {group.name}</h3>

            <p>
              <strong>Link:</strong>{" "}
              {group.url || "Chưa có"}
            </p>

            <p>
              ⭐ {group.rating}/5
            </p>

            <p>
              🟢 {group.status}
            </p>

            <p>
              📌 Đã đăng: {group.totalPosts}
            </p>

            <p>
              🚗 Phù hợp: {group.suitableCars.length} dòng xe
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default FacebookGroups;