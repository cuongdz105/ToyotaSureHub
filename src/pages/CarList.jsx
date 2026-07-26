import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCars, deleteCar } from "../services/carService";
import Button from "../components/UI/Button";
import {
  formatPrice,
  formatOdo,
} from "../utils/format";

import { filterCars } from "../utils/carFilter";
import CarRowActions from "../components/CarList/CarRowActions";
import CarTable from "../components/CarList/CarTable";
import { CAR_STATUS } from "../constants/carStatus";

function CarList() {
  const navigate = useNavigate();
  const [cars, setCars] = useState(getCars());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  const filteredCars = filterCars(
  cars,
  search,
  statusFilter
);

   function handleDelete(id) {
    const ok = window.confirm("Ông chắc chắn muốn xóa xe này chứ?");

    if (!ok) return;

    deleteCar(id);

    setCars(getCars());
  }

  return (
    <div className="app">
      
      <main className="content">
        <div className="topbar">
          <h1>Quản lý xe</h1>

         <Button
  onClick={() => navigate("/cars/new")}
>
  ➕ Thêm xe
</Button>
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
  {CAR_STATUS.map((status) => (
    <option key={status}>
      {status}
    </option>
  ))}
</select>
        

        <CarTable
  cars={filteredCars}
  navigate={navigate}
  onDelete={handleDelete}
/>
      </main>
    </div>
  );
}

export default CarList;