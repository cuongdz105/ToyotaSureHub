import Sidebar from "../components/Sidebar";
import CarForm from "../components/CarForm";

function EditCar() {
  return (
    <div className="app">
      <Sidebar />

      <main className="content">
        <h1>✏️ Sửa thông tin xe</h1>

        <CarForm />
      </main>
    </div>
  );
}

export default EditCar;