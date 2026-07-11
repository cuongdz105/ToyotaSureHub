import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { getCars, deleteCar } from "../services/carService";

function CarList() {
  const navigate = useNavigate();
  const [cars, setCars] = useState(getCars());
  const [search, setSearch] = useState("");

  const filteredCars = cars.filter((car) => {
  const carName =
    `${car.brand} ${car.model} ${car.version}`.toLowerCase();

  return carName.includes(search.toLowerCase());
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
                  <button>👁️</button>

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