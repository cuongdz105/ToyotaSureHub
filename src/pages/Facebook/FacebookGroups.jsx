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
      alert("Vui lòng nhập tên hội nhóm.");
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

      <p>Quản lý thư viện hội nhóm Facebook.</p>

      <hr />

      <h2>➕ Thêm hội nhóm</h2>

      <input
        type="text"
        placeholder="Tên hội nhóm"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Link nhóm (không bắt buộc)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <br /><br />

      <button onClick={handleAddGroup}>
        ➕ Thêm nhóm
      </button>

      <hr />

      <h2>📚 Thư viện hội nhóm</h2>

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

            {group.url && (
              <p>
                🌐
                <a
                  href={group.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Mở hội nhóm
                </a>
              </p>
            )}
          </div>
        ))
      )}

    </div>
  );
}

export default FacebookGroups;