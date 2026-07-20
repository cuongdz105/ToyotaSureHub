import { loadHistory, clearHistory } from "../ai/history/historyService";
import { useState } from "react";

function AIHistory() {
  const [history, setHistory] = useState(loadHistory());

  const handleClear = () => {
    if (!window.confirm("Xóa toàn bộ lịch sử AI?")) return;

    clearHistory();
    setHistory([]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🤖 Toyota AI History</h1>

      <button onClick={handleClear}>
        🗑️ Xóa lịch sử
      </button>

      <hr />

      {history.length === 0 ? (
        <p>Chưa có dữ liệu.</p>
      ) : (
        history.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ddd",
              padding: 15,
              marginBottom: 15,
              borderRadius: 10,
            }}
          >
            <h3>{item.title}</h3>

            <p>
              <b>Xe:</b> {item.car}
            </p>

            <p>
              <b>Loại:</b> {item.type}
            </p>

            <pre>{item.content}</pre>
          </div>
        ))
      )}
    </div>
  );
}

export default AIHistory;