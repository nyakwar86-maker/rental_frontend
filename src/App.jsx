import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext'; // ADD THIS
import Header from './components/common/Header';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Apartments from './pages/Apartments';
import ApartmentDetail from './pages/ApartmentDetail';
import CreateApartment from './pages/CreateApartment';
import NotFound from './pages/NotFound';
import EditApartment from './pages/EditApartment';
import MyListings from './pages/MyListings';
import Chat from './pages/Chat'; // NEW

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider> {/* WRAP WITH CHAT PROVIDER */}
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Public Routes */}
                <Route path="/apartments" element={<Apartments />} />
                <Route path="/apartments/:id" element={<ApartmentDetail />} />

                {/* Protected Routes */}
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                <Route path="/chat/:conversationId" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />

                {/* <Route path="/landlord/dashboard" element={
                  <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                    <LandlordDashboard />
                  </ProtectedRoute>
                } /> */}

                {/* <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } /> */}

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                <Route path="/apartments/create" element={
                  <ProtectedRoute>
                    <CreateApartment />
                  </ProtectedRoute>
                } />

                <Route path="/apartments/:id/edit" element={
                  <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                    <EditApartment />
                  </ProtectedRoute>
                } />

                <Route path="/conversations" element={
                  <ProtectedRoute>
                    <div>Conversations (Coming Soon)</div>
                  </ProtectedRoute>
                } />

                <Route path="/conversations/:id" element={
                  <ProtectedRoute>
                    <div>Conversation Detail (Coming Soon)</div>
                  </ProtectedRoute>
                } />

              // Add this route
                <Route path="/landlord/listings" element={
                  <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                    <MyListings />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#10B981',
                  },
                },
                error: {
                  style: {
                    background: '#EF4444',
                  },
                },
              }}
            />
          </div>
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;