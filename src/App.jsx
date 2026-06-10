import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ActivationForm from './pages/ActivationForm';
import DealerLogin from './dealer/DealerLogin';
import DealerLayout from './dealer/DealerLayout';
import DashboardSummary from './dealer/DashboardSummary';
import TicketsList from './dealer/TicketsList';
import CustomersList from './dealer/CustomersList';
import VehiclesList from './dealer/VehiclesList';
import CustomerDetail from './dealer/CustomerDetail';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('dealer_auth') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/dealer/login" replace />;
  }
  
  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Main Public Route */}
        <Route path="/" element={<ActivationForm />} />
        
        {/* Dealer Login */}
        <Route path="/dealer/login" element={<DealerLogin />} />
        
        {/* Protected Dealer Routes */}
        <Route 
          path="/dealer" 
          element={
            <ProtectedRoute>
              <DealerLayout />
            </ProtectedRoute>
          }
        >
          {/* Index route for /dealer goes to summary */}
          <Route index element={<DashboardSummary />} />
          <Route path="tickets" element={<TicketsList />} />
          <Route path="customers" element={<CustomersList />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="vehicles" element={<VehiclesList />} />
        </Route>
        
        {/* Catch all to public route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}