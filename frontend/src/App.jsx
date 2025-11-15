// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardContent from './components/DashboardContent';
import DoctorPage from './pages/DoctorPage';
import MedicinePage from './pages/MedicinePage';
import PatientPage from './pages/PatientPage';
import PrescriptionPage from './pages/PrescriptionPage';
import PaymentPage from './pages/PaymentPage';
import BillingPage from './pages/BillingPage';
import ReportingPage from './pages/ReportingPage';
import RawatPage from './pages/RawatInap';

// Komponen Placeholder untuk halaman lain
const PlaceholderPage = ({ title }) => (
    <main className="p-6 space-y-6">
        <h3 className="text-2xl font-bold text-gray-700">{title}</h3>
        <div className="bg-white rounded-2xl shadow p-6 h-96 flex items-center justify-center">
            <p className="text-gray-500">Konten untuk halaman **{title}** akan dimuat di sini.</p>
        </div>
    </main>
);

const App = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Logika untuk sidebar di tampilan desktop/mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Panggil sekali saat mount
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <Router>
            <div className="bg-gray-100 flex min-h-screen">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

                <div className="flex-1 flex flex-col">
                    <Header toggleSidebar={toggleSidebar} />
                    
                    {/* Konten Dashboard (Rute) */}
                    <Switch>
                        {/* Rute Default */}
                        <Route exact path="/">
                            <DashboardContent />
                        </Route>

                        {/* Rute Halaman Lain */}
                        <Route path="/pasien">
                            <PatientPage />
                        </Route>
                        <Route path="/dokter">
                            <DoctorPage />
                        </Route>
                        <Route path="/obat">
                            <MedicinePage />
                        </Route>
                        <Route path="/resep">
                            <PrescriptionPage />
                        </Route>
                        <Route path="/pembayaran">
                            <PaymentPage />
                        </Route>
                        <Route path="/tagihan">
                            <BillingPage />
                        </Route>
                        <Route path="/laporan"> 
                            <ReportingPage /> 
                        </Route>
                         <Route path="/rawat-inap"> 
                            <RawatPage />
                        </Route>
                        {/* Opsional: Redirect atau Halaman 404 */}
                        <Route path="*">
                            <Redirect to="/" />
                        </Route>
                    </Switch>
                </div>
            </div>
        </Router>
    );
};

export default App;