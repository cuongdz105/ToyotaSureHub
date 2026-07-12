import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { getCars, deleteCar } from "../services/carService";

function CarList() {
  const navigate = useNavigate();
  const [cars, setCars] = useState(getCars());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

 const filteredCars = cars
  .filter((car) => {
    const carName =
      `${car.brand} ${car.model} ${car.version}`.toLowerCase();

    const matchSearch =
      carName.includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "Tất cả"
        ? true
        : car.status === statusFilter;

    return matchSearch && matchStatus;
  })
  .sort((a, b) => {
    // Sắp xếp theo dòng xe
    const modelCompare = a.model.localeCompare(
      b.model,
      "vi"
    );

    if (modelCompare !== 0) {
      return modelCompare;
    }

    // Cùng dòng xe -> năm mới hơn lên trước
    if (a.year !== b.year) {
      return b.year - a.year;
    }

    // Cùng năm -> ODO ít hơn lên trước
    return a.odo - b.odo;
  });
  function handleDelete(id) {
    const ok = window.confirm("Ông chắc chắn muốn xóa xe này chứ?");

    if (!ok) return;

    deleteCar(id);

    setCars(getCars());
  }

  return (
    <div className="app">
      <Sidebar />

      <main className="content">
        <div className="topbar">
          <h1>Quản lý xe</h1>

          <button
            className="add-btn"
            onClick={() => navigate("/cars/new")}
          >
            ➕ Thêm xe
          </button>
        </div>

       <input
  type="text"
  placeholder="🔍 Tìm kiếm xe..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="search-box"
/>

<select
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  className="search-box"
>
  <option>Tất cả</option>
  <option>🟢 Đang bán</option>
  <option>🟡 Đang cọc</option>
  <option>🔴 Đã bán</option>
  <option>🔵 Chờ nhập kho</option>
  <option>⚫ Đang bảo dưỡng</option>
  <option>🟣 Đã xuất kho</option>
</select>
        

        <table className="car-table">
          <thead>
            <tr>
              <th>Tên xe</th>
              <th>Năm</th>
              <th>Màu</th>
              <th>Giá</th>
              <th>ODO</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {filteredCars.map((car) => (
              <tr key={car.id}>
                <td>
  {car.brand} {car.model} {car.version}
</td>
                <td>{car.year}</td>
                <td>{car.color}</td>
               <td>{car.price} triệu</td>

<td>{car.odo.toLocaleString()} km</td>
                <td>{car.status}</td>

                <td>
                  <button
  onClick={() => navigate(`/cars/${car.id}`)}
>
  👁️
</button>

                  <button
                    onClick={() => navigate(`/edit/${car.id}`)}
                  >
                    ✏️
                  </button>

                  <button onClick={() => handleDelete(car.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default CarList;