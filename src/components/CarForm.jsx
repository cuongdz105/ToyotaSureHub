import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addCar, updateCar } from "../services/carService";
import { brands } from "../data/brands";
import { colors } from "../data/colors";
import { warranties } from "../data/warranty";
import { legalTypes } from "../data/legal";
import { statusList } from "../data/status";

function CarForm({ editCar }) {
  const navigate = useNavigate();

const [car, setCar] = useState({
  name: "",          // 👈 Giữ lại tạm thời
  brand: "Toyota",
  model: "",
  version: "",
  year: "",
  color: "",
  odo: "",
  warranty: "Toyota Sure",
  legal: "Cá nhân",
  price: "",
  status: "🟢 Đang bán",
  images: [],
  notes: "",
});

  const [previewImages, setPreviewImages] = useState([]);
  const selectedBrand = brands.find(
  (brand) => brand.name === car.brand
);

const models = selectedBrand
  ? selectedBrand.models
  : [];

const selectedModel = models.find(
  (model) => model.name === car.model
);

const versions = selectedModel
  ? selectedModel.versions
  : [];

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
   if (!car.brand) {
  alert("Vui lòng chọn hãng xe!");
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
        <label>Hãng xe</label>
       <select
  name="brand"
  value={car.brand}
  onChange={handleChange}
>
  {brands.map((brand) => (
    <option
      key={brand.name}
      value={brand.name}
    >
      {brand.name}
    </option>
  ))}
</select>
</div>
<div className="form-group">
  <label>Dòng xe</label>

  <select
    name="model"
    value={car.model}
    onChange={handleChange}
  >
    <option value="">-- Chọn dòng xe --</option>

    {models.map((model) => (
      <option
        key={model.name}
        value={model.name}
      >
        {model.name}
      </option>
    ))}
  </select>
</div>
    <div className="form-group">
  <label>Phiên bản</label>

  <select
    name="version"
    value={car.version}
    onChange={handleChange}
  >
    <option value="">-- Chọn phiên bản --</option>

    {versions.map((version) => (
      <option
        key={version.name}
        value={version.name}
      >
        {version.name}
      </option>
    ))}
  </select>
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