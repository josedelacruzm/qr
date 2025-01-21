import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './components/menu.jsx';
import Home from './pages/home.jsx';
import UserDashboard from './pages/userDashboard.jsx';
import PrivateRoute from './components/privateRoute.jsx';
import AdminDashboard from './pages/adminDashboard.jsx';
import FallecidoCreateModal from './components/fallecidoCreateModal.jsx';
import FallecidoPage from './pages/fallecidoPage.jsx'
import FallecidoBulkList from './components/fallecidoBulkList.jsx';

function App() {
    return (
        <Router>
        <Menu/>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={
                        <UserDashboard />
                } />
                <Route path="/dashboard/:id" element={<UserDashboard />} />
                <Route path="/ser-querido/" element={
                        <FallecidoBulkList />

                } />
                <Route path="/ser-querido/new" element={
                    <PrivateRoute>
                        <FallecidoCreateModal />
                    </PrivateRoute>
                } />
                <Route path="/ser-querido/:fallecidoid" element={
                        <FallecidoPage />
                } />
                <Route path="/admindashboard" element={
                    <PrivateRoute>
                        <AdminDashboard />
                    </PrivateRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;
