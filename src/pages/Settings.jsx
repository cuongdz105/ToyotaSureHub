import Sidebar from "../components/Sidebar";

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

  return (
    <div className="app">
      <Sidebar />

      <main className="content">
        <h1>⚙️ Cài đặt</h1>

        <div className="form-container">
          <button
            className="save-btn"
            onClick={handleBackup}
          >
            💾 Backup dữ liệu
          </button>
        </div>
      </main>
    </div>
  );
}

export default Settings;