import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { addCar, updateCar } from "../services/carService";

import { brands } from "../data/brands";
import { colors } from "../data/colors";
import { warranties } from "../data/warranty";
import { legalTypes } from "../data/legal";
import { statusList } from "../data/status";
import ImageUploader from "./ImageUploader";

function CarForm({ editCar }) {
  const navigate = useNavigate();

  const [car, setCar] = useState(
  editCar || {
    brand: "Toyota",
    model: "",
    version: "",
    year: "",
    color: "",
    odo: "",
    warranty: "Toyota Sure",
    legal: "Cá nhân",
    status: "🟢 Đang bán",
    price: "",
    checked: true,
    accidentFree: true,
    engineOriginal: true,
    floodFree: true,
    fineFree: true,
    notes: "",
    images: [],
  }
);

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

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setCar((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function handleSave() {
    if (!car.brand) {
      alert("Chọn hãng xe");
      return;
    }

    if (!car.model) {
      alert("Chọn dòng xe");
      return;
    }

    if (!car.version) {
      alert("Chọn phiên bản");
      return;
    }

   if (editCar) {
  updateCar(car);

  alert("✅ Đã cập nhật xe");
} else {
  addCar(car);

  alert("✅ Đã thêm xe");
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
        />
      </div>

      <div className="form-group">
        <label>Màu xe</label>

        <select
          name="color"
          value={car.color}
          onChange={handleChange}
        >
          <option value="">-- Chọn màu xe --</option>

          {colors.map((color) => (
            <option
              key={color}
              value={color}
            >
              {color}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>ODO (km)</label>

        <input
          type="number"
          name="odo"
          value={car.odo}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Giá (triệu)</label>

        <input
          type="number"
          name="price"
          value={car.price}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Bảo hành</label>

        <select
          name="warranty"
          value={car.warranty}
          onChange={handleChange}
        >
          {warranties.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Pháp lý</label>

        <select
          name="legal"
          value={car.legal}
          onChange={handleChange}
        >
          {legalTypes.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Trạng thái</label>

        <select
          name="status"
          value={car.status}
          onChange={handleChange}
        >
          {statusList.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </div>
            <hr />

      <h3>🛡️ Cam kết Toyota Sure</h3>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="checked"
            checked={car.checked}
            onChange={handleChange}
          />
          {" "}Đã kiểm định theo tiêu chuẩn Toyota Sure
        </label>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="accidentFree"
            checked={car.accidentFree}
            onChange={handleChange}
          />
          {" "}Không tai nạn
        </label>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
           name="engineOriginal"
checked={car.engineOriginal}
            onChange={handleChange}
          />
          {" "}Không bổ máy
        </label>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="floodFree"
            checked={car.floodFree}
            onChange={handleChange}
          />
          {" "}Không ngập nước
        </label>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="fineFree"
            checked={car.fineFree}
            onChange={handleChange}
          />
          {" "}Không phạt nguội
        </label>
      </div>

      <div className="form-group">
        <label>Ghi chú</label>

        <textarea
          name="notes"
          value={car.notes}
          onChange={handleChange}
          rows="4"
        />
      </div>
 <ImageUploader
  images={car.images}
  setImages={(images) =>
    setCar({
      ...car,
      images,
    })
  }
/>
      <button
        className="save-btn"
        onClick={handleSave}
      >
       
        💾 Lưu xe
      </button>

    </div>
  );
}

export default CarForm;