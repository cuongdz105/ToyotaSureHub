import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addCar, updateCar } from "../services/carService";

function CarForm({ editCar }) {
  const navigate = useNavigate();

  const [car, setCar] = useState({
    name: "",
    version: "",
    year: "",
    color: "",
    odo: "",
    warranty: "",
    legal: "Cá nhân",
    price: "",
  });

  useEffect(() => {
    if (editCar) {
      setCar(editCar);
    }
  }, [editCar]);

  function handleChange(e) {
    setCar({
      ...car,
      [e.target.name]: e.target.value,
    });
  }

  function handleSave() {
    if (!car.name.trim()) {
      alert("Ông nhập tên xe trước nhé 😄");
      return;
    }

    if (editCar) {
      updateCar(car);
      alert("✅ Đã cập nhật xe thành công!");
    } else {
      addCar(car);
      alert("✅ Đã thêm xe thành công!");
    }

    navigate("/cars");
  }

  return (
    <div className="form-container">
      <div className="form-group">
        <label>Tên xe</label>
        <input
          name="name"
          value={car.name}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Phiên bản</label>
        <input
          name="version"
          value={car.version}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Năm sản xuất</label>
        <input
          name="year"
          value={car.year}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Màu xe</label>
        <input
          name="color"
          value={car.color}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>ODO</label>
        <input
          name="odo"
          value={car.odo}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Bảo hành</label>
        <input
          name="warranty"
          value={car.warranty}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Pháp lý</label>

        <select
          name="legal"
          value={car.legal}
          onChange={handleChange}
        >
          <option>Cá nhân</option>
          <option>Công ty</option>
        </select>
      </div>

      <div className="form-group">
        <label>Giá bán</label>
        <input
          name="price"
          value={car.price}
          onChange={handleChange}
        />
      </div>

      <button
        className="save-btn"
        onClick={handleSave}
      >
        {editCar ? "💾 Cập nhật xe" : "💾 Lưu xe"}
      </button>
    </div>
  );
}

export default CarForm;