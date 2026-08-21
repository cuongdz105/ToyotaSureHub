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
import FacebookPostPreview from "./pages/Facebook/FacebookPostPreview";
import FacebookPostingQueue from "./pages/Facebook/FacebookPostingQueue";
import SupabaseCarTest from "./pages/SupabaseCarTest";
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// =======================================
// CONTENT LIBRARY
// =======================================

import ContentLibrary from "./components/ContentLibrary";

// =======================================
// SUPABASE TEST
// =======================================

import SupabaseTest from "./pages/SupabaseTest";


function App() {
  return (
    <AuthProvider>
      <Routes>

      {/* =================================
          SUPABASE TEST
      ================================= */}

      <Route
        path="/supabase-test"
        element={<SupabaseTest />}
      />


      {/* =================================
          MAIN APPLICATION
      ================================= */}

<Route
  path="/supabase-car-test"
  element={<SupabaseCarTest />}
/>

<Route
  path="/login"
  element={<Login />}
/>

      <Route
  element={
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  }
>

        {/* Dashboard */}
        <Route
          path="/"
          element={<Dashboard />}
        />

        {/* Cars */}
        <Route
          path="/cars"
          element={<CarList />}
        />

        <Route
          path="/cars/new"
          element={<AddCar />}
        />

        <Route
          path="/edit/:id"
          element={<EditCar />}
        />

        <Route
          path="/cars/:id"
          element={<CarWorkspace />}
        />

        {/* Customers */}
        <Route
          path="/customers"
          element={<Customers />}
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={<Settings />}
        />

        {/* AI */}
        <Route
          path="/ai-history"
          element={<AIHistory />}
        />

        <Route
          path="/ai-workspace"
          element={<AIWorkspace />}
        />

        {/* Campaign */}
        <Route
          path="/campaign"
          element={<CampaignPage />}
        />


        {/* =================================
            CONTENT LIBRARY
        ================================= */}

        <Route
          path="/content-library"
          element={<ContentLibrary />}
        />


        {/* =================================
            FACEBOOK
        ================================= */}

        <Route
          path="/facebook/accounts"
          element={<FacebookAccounts />}
        />

        <Route
          path="/facebook/groups"
          element={<FacebookGroups />}
        />

        <Route
          path="/facebook/post"
          element={<FacebookPostPreview />}
        />

        <Route
          path="/facebook/queue"
          element={<FacebookPostingQueue />}
        />

      </Route>

          </Routes>
    </AuthProvider>
  );
}

export default App;