import { useEffect, useState } from "react";
import {
  loadAccounts,
  addAccount,
} from "../../services/facebookAccountService";

function FacebookAccounts() {
  const [accounts, setAccounts] = useState([]);

  const [name, setName] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    refreshAccounts();
  }, []);

  function refreshAccounts() {
    setAccounts(loadAccounts());
  }

  function handleAddAccount() {
    if (!name.trim()) {
      alert("Vui lòng nhập tên tài khoản.");
      return;
    }

    addAccount({
      name,
      profileUrl,
      note,
    });

    setName("");
    setProfileUrl("");
    setNote("");

    refreshAccounts();
  }

  return (
    <div className="content">

      <h1>👤 Facebook Accounts</h1>

      <p>Quản lý các tài khoản Facebook dùng để đăng bài.</p>

      <hr />

      <h3>➕ Thêm tài khoản</h3>

      <input
        type="text"
        placeholder="Tên tài khoản"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        type="text"
        placeholder="Link Facebook"
        value={profileUrl}
        onChange={(e) => setProfileUrl(e.target.value)}
      />

      <br /><br />

      <textarea
        rows="3"
        placeholder="Ghi chú"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <br /><br />

      <button onClick={handleAddAccount}>
        💾 Lưu tài khoản
      </button>

      <hr />

      <h3>📋 Danh sách tài khoản</h3>

      {accounts.length === 0 ? (
        <p>Chưa có tài khoản nào.</p>
      ) : (
        accounts.map((account) => (
          <div
            key={account.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 15,
              marginBottom: 15,
            }}
          >
            <h3>👤 {account.name}</h3>

            <p>
              <strong>Link:</strong>{" "}
              {account.profileUrl || "Chưa có"}
            </p>

            <p>
              <strong>Ghi chú:</strong>{" "}
              {account.note || "Không có"}
            </p>

            <p>
              <strong>Trạng thái:</strong>{" "}
              {account.status}
            </p>

            <p>
              <strong>Số nhóm:</strong>{" "}
              {account.groups.length}
            </p>

            <p>
              <strong>Tổng bài:</strong>{" "}
              {account.totalPosts || 0}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default FacebookAccounts;