
function Settings() {
  function handleBackup() {
    const data = localStorage.getItem("toyota_sure_hub_cars");

    if (!data) {
      alert("Không có dữ liệu để backup.");
      return;
    }

    const blob = new Blob([data], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = `ToyotaSureHub_Backup_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    a.click();

    URL.revokeObjectURL(url);

    alert("✅ Backup thành công!");
  }

function handleRestore(e) {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    try {
      const cars = JSON.parse(event.target.result);

      localStorage.setItem(
        "toyota_sure_hub_cars",
        JSON.stringify(cars)
      );

      alert("✅ Khôi phục dữ liệu thành công!");

      window.location.href = "/cars";
    } catch {
      alert("❌ File không hợp lệ.");
    }
  };

  reader.readAsText(file);
}

function handleClear() {
  const ok = window.confirm(
    "Ông có chắc chắn muốn xóa toàn bộ dữ liệu không?"
  );

  if (!ok) return;

  localStorage.removeItem("toyota_sure_hub_cars");

  alert("🗑️ Đã xóa toàn bộ dữ liệu.");

  window.location.href = "/cars";
}

  return (
    <div className="app">
      
            <main className="content">
        <h1>⚙️ Cài đặt</h1>

        <div className="form-container">
          <button
            className="save-btn"
            onClick={handleBackup}
          >
            💾 Backup dữ liệu
          </button>
         <input
  type="file"
  id="restoreFile"
  accept=".json"
  style={{ display: "none" }}
  onChange={handleRestore}
/>

<button
  className="save-btn"
  style={{ marginTop: "15px" }}
  onClick={() =>
    document
      .getElementById("restoreFile")
      .click()
  }
>
  📂 Khôi phục dữ liệu
</button>
<button
  className="save-btn"
  style={{
    marginTop: "15px",
    background: "#dc2626",
  }}
  onClick={handleClear}
>
  🗑️ Xóa toàn bộ dữ liệu
</button>
        </div>
      </main>
    </div>
  );
}

export default Settings;