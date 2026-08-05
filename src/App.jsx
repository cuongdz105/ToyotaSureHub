import "./App.css";
import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import CarList from "./pages/CarList";
import AddCar from "./pages/AddCar";
import EditCar from "./pages/EditCar";
import CarWorkspace from "./pages/CarWorkspace";
import Settings from "./pages/Settings";
import Customers from "./pages/Customers";
import AIHistory from "./pages/AIHistory";
import MainLayout from "./layouts/MainLayout";
import AIWorkspace from "./pages/AIWorkspace";
import CampaignPage from "./pages/CampaignPage";
import FacebookAccounts from "./pages/Facebook/FacebookAccounts";
import FacebookGroups from "./pages/Facebook/FacebookGroups";

function App() {
  return (
    <Routes>
  <Route element={<MainLayout />}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/cars" element={<CarList />} />
    <Route path="/cars/new" element={<AddCar />} />
    <Route path="/edit/:id" element={<EditCar />} />
    <Route path="/customers" element={<Customers />} />
    <Route path="/cars/:id" element={<CarWorkspace />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/ai-history" element={<AIHistory />} />
    <Route path="/ai-workspace" element={<AIWorkspace />} />
    <Route path="/campaign" element={<CampaignPage />} />
    <Route
    path="/facebook/accounts"
    element={<FacebookAccounts />}
/>
<Route
  path="/facebook/groups"
  element={<FacebookGroups />}
/>
  </Route>
</Routes>
  );
}
 

export default App;