import "./App.css";
import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import CarList from "./pages/CarList";
import AddCar from "./pages/AddCar";
import EditCar from "./pages/EditCar";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/cars" element={<CarList />} />
      <Route path="/cars/new" element={<AddCar />} />
      <Route path="/edit/:id" element={<EditCar />} />
    </Routes>
  );
}

export default App;