import { AnimatePresence, motion } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";
import Clients from "../screens/Clients";
import ClientDetail from "../screens/ClientDetail";
import Measurements from "../screens/Measurements";
import MeasurementForm from "../screens/MeasurementForm";
import OrderForm from "../screens/OrderForm";
import OrderDetail from "../screens/OrderDetail";
import PaymentForm from "../screens/PaymentForm";
import Settings from "../screens/Settings";
export default function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Clients />} />
          <Route path="/clientes/:id" element={<ClientDetail />} />
          <Route path="/medidas" element={<Measurements />} />
          <Route
            path="/clientes/:id/medidas/nueva"
            element={<MeasurementForm />}
          />
          <Route path="/clientes/:id/pedido/nuevo" element={<OrderForm />} />
          <Route path="/pedidos/:id" element={<OrderDetail />} />
          <Route path="/pedidos/:id/pago" element={<PaymentForm />} />
          <Route path="/ajustes" element={<Settings />} />
          <Route path="*" element={<Clients />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
