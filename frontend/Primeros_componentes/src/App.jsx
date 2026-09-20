import { Routes, Route, useLocation } from "react-router-dom";
import './App.css';

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Carrusel from "./components/Carrusel";
import Inicio from "./components/Inicio";

import QuienesSomos from "./pages/QuienesSomos";
import Contacto from "./pages/Contacto";
import Login from "./pages/Login";
import Productos from "./pages/Productos";
import AdminPanel from "./pages/AdminPanel";
import AdminUsers from "./pages/AdminUsers";
import AdminProducts from "./pages/AdminProducts";
import AdminVentas from "./pages/AdminVentas";
import AdminPQRS from "./pages/AdminPQRS";
import AdminReportes from "./pages/AdminReportes";
import ClientPanel from "./pages/ClientPanel";
import EmployeePanel from "./pages/EmployeePanel";
import EmployeeRoute from "./components/EmployeeRoute";
import AdminRoute from "./components/AdminRoute";
import ClientRoute from "./components/ClientRoute";
import WhatsAppButton from "./components/WhatsAppButton";
import Chatbot from "./components/Chatbot";
import AdminLayout from "./components/AdminLayout";
import EmployeeLayout from "./components/EmployeeLayout";


// Rutas que tienen su propio layout (sin Navbar/Footer global)
const RUTAS_ADMIN = [
  "/admin", "/admin/usuarios", "/admin/productos", "/admin/ventas", "/admin/pqrs", "/admin/reportes",
  "/empleado", "/empleado/productos",
];

function App() {
  const location = useLocation();
  const esRutaAdmin = RUTAS_ADMIN.some((r) => location.pathname === r);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1120] text-white">
      {/* Navbar solo en rutas que NO son del panel admin */}
      {!esRutaAdmin && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* ── Rutas públicas ── */}
          <Route path="/" element={<Inicio />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/iniciar-sesion" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* ── Panel Cliente ── */}
          <Route
            path="/cliente"
            element={
              <ClientRoute>
                <ClientPanel />
              </ClientRoute>
            }
          />

          {/* ── Panel Empleado ── */}
          <Route
            path="/empleado"
            element={
              <EmployeeRoute>
                <EmployeeLayout>
                  <EmployeePanel />
                </EmployeeLayout>
              </EmployeeRoute>
            }
          />
          <Route
            path="/empleado/productos"
            element={
              <EmployeeRoute>
                <EmployeeLayout>
                  <AdminProducts panelPath="/empleado" />
                </EmployeeLayout>
              </EmployeeRoute>
            }
          />

          {/* ── Panel Admin (AdminLayout propio con sidebar) ── */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminPanel />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/productos"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminProducts />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/ventas"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminVentas />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/pqrs"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminPQRS />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reportes"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminReportes />
                </AdminLayout>
              </AdminRoute>
            }
          />
        </Routes>
      </main>

      {/* Footer, WhatsApp y Chatbot IA fuera del panel admin */}
      {!esRutaAdmin && <Footer />}
      {!esRutaAdmin && <WhatsAppButton />}
      {!esRutaAdmin && <Chatbot />}
    </div>
  );
}


export default App;
