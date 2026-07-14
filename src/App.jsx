import "./App.css";
import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import CarList from "./pages/CarList";
import AddCar from "./pages/AddCar";
import EditCar from "./pages/EditCar";
import CarDetail from "./pages/CarDetail";
import Settings from "./pages/Settings";
import Customers from "./pages/Customers";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/cars" element={<CarList />} />
      <Route path="/cars/new" element={<AddCar />} />
      <Route path="/edit/:id" element={<EditCar />} />
      <Route path="/customers" element={<Customers />} />
    
      <Route
  path="/cars/:id"
  element={<CarDetail />}
/>
<Route
  path="/settings"
  element={<Settings />}
  />
    </Routes>
  );
}
 

export default App;