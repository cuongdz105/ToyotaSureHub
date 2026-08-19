import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import CarForm from "../components/CarForm";
import {
  getCarByIdFromSupabase,
} from "../services/carSupabaseService";


function EditCar() {

  const { id } = useParams();

  const [car, setCar] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    async function loadCar() {

      try {

        setLoading(true);
        setError("");

        const data =
          await getCarByIdFromSupabase(id);

        if (!data) {

          setError(
            "Không tìm thấy xe trên Supabase."
          );

          return;
        }

        setCar(data);

      } catch (err) {

        console.error(
          "Load car for edit error:",
          err
        );

        setError(
          err?.message ||
          "Không thể tải thông tin xe."
        );

      } finally {

        setLoading(false);

      }

    }


    loadCar();

  }, [id]);


  if (loading) {

    return (
      <div className="app">
        <main className="content">

          <h1>
            ✏️ Sửa thông tin xe
          </h1>

          <div
            style={{
              padding: 30,
              background: "#fff",
              borderRadius: 12,
            }}
          >
            ⏳ Đang tải thông tin xe...
          </div>

        </main>
      </div>
    );

  }


  if (error) {

    return (
      <div className="app">
        <main className="content">

          <h1>
            ✏️ Sửa thông tin xe
          </h1>

          <div
            style={{
              padding: 30,
              background: "#fff0f0",
              color: "#d71920",
              borderRadius: 12,
            }}
          >
            ❌ {error}
          </div>

        </main>
      </div>
    );

  }


  return (
    <div className="app">

      <main className="content">

        <h1>
          ✏️ Sửa thông tin xe
        </h1>

        <CarForm
          editCar={car}
        />

      </main>

    </div>
  );
}


export default EditCar;