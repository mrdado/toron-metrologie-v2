import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/layout/PrivateRoute';
import Login from './pages/Login';
import Layout from './components/layout/Layout';
import HomeLayout from './components/layout/HomeLayout';
import Home from './pages/Home';
import { useInventory } from './context/InventoryContext';

// Placeholder components for routes we haven't built yet
const Placeholder = ({ title }) => (
  <div className="text-center py-10">
    <h2 className="text-2xl font-bold text-gray-300">{title}</h2>
    <p className="text-gray-400">En cours de développement...</p>
  </div>
);

import { InventoryProvider } from './context/InventoryContext';

import ScanGlobal from './pages/ScanGlobal';

import ScanToron from './pages/torons/ScanToron';
import AddToron from './pages/torons/AddToron';
import EditToron from './pages/torons/EditToron';
import ListToron from './pages/torons/ListToron';
import ViewToron from './pages/torons/ViewToron';

import ScanEquipment from './pages/equipment/ScanEquipment';
import AddEquipment from './pages/equipment/AddEquipment';
import EditEquipment from './pages/equipment/EditEquipment';
import ListEquipment from './pages/equipment/ListEquipment';
import ViewEquipment from './pages/equipment/ViewEquipment';

const HomeWithStats = () => {
  const { torons, equipements } = useInventory();

  // Calculate expired calibrations
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiredCount = equipements.filter(eq => {
    if (eq.dateExpiration) {
      const expDate = new Date(eq.dateExpiration);
      expDate.setHours(0, 0, 0, 0);
      return expDate < today;
    }
    return false;
  }).length;

  return (
    <HomeLayout
      showStats={true}
      statsData={{
        toronCount: torons.length,
        equipmentCount: equipements.length,
        expiredCount: expiredCount
      }}
    >
      <Home />
    </HomeLayout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <InventoryProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
              <PrivateRoute>
                <HomeWithStats />
              </PrivateRoute>
            } />

            <Route path="/scan" element={
              <PrivateRoute>
                <Layout>
                  <ScanGlobal />
                </Layout>
              </PrivateRoute>
            } />

            {/* Toron Routes */}
            <Route path="/torons/scan" element={
              <PrivateRoute>
                <Layout>
                  <ScanToron />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/torons/add" element={
              <PrivateRoute>
                <Layout>
                  <AddToron />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/torons/edit/:id" element={
              <PrivateRoute>
                <Layout>
                  <EditToron />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/torons/edit" element={
              <PrivateRoute>
                <Layout>
                  <ListToron />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/torons/view/:id" element={
              <PrivateRoute>
                <Layout>
                  <ViewToron />
                </Layout>
              </PrivateRoute>
            } />

            {/* Equipment Routes */}
            <Route path="/equipements/scan" element={
              <PrivateRoute>
                <Layout>
                  <ScanGlobal />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/equipements/add" element={
              <PrivateRoute>
                <Layout>
                  <AddEquipment />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/equipements/edit/:id" element={
              <PrivateRoute>
                <Layout>
                  <EditEquipment />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/equipements/edit" element={
              <PrivateRoute>
                <Layout>
                  <ListEquipment />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/equipements/view/:id" element={
              <PrivateRoute>
                <Layout>
                  <ViewEquipment />
                </Layout>
              </PrivateRoute>
            } />
          </Routes>
        </InventoryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
