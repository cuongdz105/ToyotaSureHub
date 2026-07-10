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
    images: [],
  });

  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    if (editCar) {
      setCar({
        ...editCar,
        images: editCar.images || [],
      });

      if (editCar.images && editCar.images.length > 0) {
        setPreviewImages(editCar.images);
      }
    }
  }, [editCar]);

  function handleChange(e) {
    setCar((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files);

    setCar((prev) => ({
      ...prev,
      images: files,
    }));

    const previews = files.map((file) => URL.createObjectURL(file));

    setPreviewImages(previews);
  }

  function handleSave() {
    if (!car.name.trim()) {
      alert("Vui lòng nhập tên xe!");
      return;
    }

    if (!car.year) {
      alert("Vui lòng nhập năm sản xuất!");
      return;
    }

    if (!car.odo) {
      alert("Vui lòng nhập ODO!");
      return;
    }

    if (!car.price) {
      alert("Vui lòng nhập giá bán!");
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
          placeholder="Toyota Vios G CVT"
        />
      </div>

      <div className="form-group">
        <label>Phiên bản</label>
        <input
          name="version"
          value={car.version}
          onChange={handleChange}
          placeholder="1.5G CVT"
        />
      </div>

      <div className="form-group">
        <label>Năm sản xuất</label>
        <input
          type="number"
          name="year"
          value={car.year}
          onChange={handleChange}
          placeholder="2023"
        />
      </div>

      <div className="form-group">
        <label>Màu xe</label>
        <input
          name="color"
          value={car.color}
          onChange={handleChange}
          placeholder="Trắng ngọc trai"
        />
      </div>

      <div className="form-group">
        <label>ODO (km)</label>
        <input
          type="number"
          name="odo"
          value={car.odo}
          onChange={handleChange}
          placeholder="25000"
        />
      </div>

      <div className="form-group">
        <label>Bảo hành</label>
        <input
          name="warranty"
          value={car.warranty}
          onChange={handleChange}
          placeholder="1 năm"
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
        <label>Giá bán (VNĐ)</label>
        <input
          type="number"
          name="price"
          value={car.price}
          onChange={handleChange}
          placeholder="650000000"
        />
      </div>

      <div className="form-group">
        <label>Hình ảnh xe</label>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      <div className="preview-container">
        {previewImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`preview-${index}`}
            className="preview-image"
          />
        ))}
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