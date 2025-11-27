// // src/App.jsx
// import { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
// import Sidebar from './components/Sidebar';
// import Header from './components/Header';
// import DashboardContent from './components/DashboardContent';
// import DoctorPage from './pages/DoctorPage';
// import MedicinePage from './pages/MedicinePage';
// import PatientPage from './pages/PatientPage';
// import PrescriptionPage from './pages/PrescriptionPage';
// import PaymentPage from './pages/PaymentPage';
// import BillingPage from './pages/BillingPage';
// import ReportingPage from './pages/ReportingPage';
// import RawatPage from './pages/RawatInap';




// // Komponen Placeholder untuk halaman lain
// const PlaceholderPage = ({ title }) => (
//     <main className="p-6 space-y-6">
//         <h3 className="text-2xl font-bold text-gray-700">{title}</h3>
//         <div className="bg-white rounded-2xl shadow p-6 h-96 flex items-center justify-center">
//             <p className="text-gray-500">Konten untuk halaman **{title}** akan dimuat di sini.</p>
//         </div>
//     </main>
// );

// const App = () => {
//     const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//     const toggleSidebar = () => {
//         setIsSidebarOpen(!isSidebarOpen);
//     };

//     // Logika untuk sidebar di tampilan desktop/mobile
//     useEffect(() => {
//         const handleResize = () => {
//             if (window.innerWidth >= 768) {
//                 setIsSidebarOpen(true);
//             }
//         };
//         window.addEventListener('resize', handleResize);
//         handleResize(); // Panggil sekali saat mount
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     return (
//         <Router>
//             <div className="bg-gray-100 flex min-h-screen">
//                 <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

//                 <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-64">
//                     <Header toggleSidebar={toggleSidebar} />
                    
//                     {/* Konten Dashboard (Rute) */}
//                     <Switch>
//                         {/* Rute Default */}
//                         <Route exact path="/">
//                             <DashboardContent />
//                         </Route>

//                         {/* Rute Halaman Lain */}
//                         <Route path="/pasien">
//                             <PatientPage />
//                         </Route>
//                         <Route path="/dokter">
//                             <DoctorPage />
//                         </Route>
//                         <Route path="/obat">
//                             <MedicinePage />
//                         </Route>
//                         <Route path="/resep">
//                             <PrescriptionPage />
//                         </Route>
//                         <Route path="/pembayaran">
//                             <PaymentPage />
//                         </Route>
//                         <Route path="/tagihan">
//                             <BillingPage />
//                         </Route>
//                         <Route path="/laporan"> 
//                             <ReportingPage /> 
//                         </Route>
//                          <Route path="/rawat-inap"> 
//                             <RawatPage />
//                         </Route>
//                         {/* Opsional: Redirect atau Halaman 404 */}
//                         <Route path="*">
//                             <Redirect to="/" />
//                         </Route>
//                     </Switch>
//                 </div>
//             </div>
//         </Router>
//     );
// };

// export default App;

// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

// Import Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardContent from './components/DashboardContent';

// Import Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientMedicalRecords from './pages/patient/PatientMedicalRecords';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientBills from './pages/patient/PatientBills';
// import PatientPayments from './pages/patient/PatientPayments';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorMedicalRecords from './pages/doctor/DoctorMedicalRecords';
// import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
// import DoctorRatings from './pages/doctor/DoctorRatings';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Handle sidebar responsive
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading SIMRS...</p>
        </div>
      </div>
    );
  }

  // Protected Route Component
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Redirect to="/login" />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Redirect to="/dashboard" />;
    }
    
    return children;
  };

  // Layout with Sidebar and Header
  const DashboardLayout = ({ children }) => (
    <div className="bg-gray-100 flex min-h-screen">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        user={user}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-64">
        <Header 
          toggleSidebar={toggleSidebar}
          user={user}
          onLogout={handleLogout}
        />
        {children}
      </div>
    </div>
  );

  return (
    <Router>
      <Switch>
        {/* Public Routes */}
        <Route exact path="/">
          {user ? <Redirect to="/dashboard" /> : <LandingPage />}
        </Route>

        <Route path="/login">
          {user ? <Redirect to="/dashboard" /> : <LoginPage onLogin={handleLogin} />}
        </Route>

        <Route path="/register">
          {user ? <Redirect to="/dashboard" /> : <RegisterPage />}
        </Route>

        {/* Dashboard Routes - Role Based */}
        <Route path="/dashboard">
          <ProtectedRoute>
            {/* <DashboardLayout> */}
              {user?.role === 'Pasien' ? <PatientDashboard user={user} /> : null}
              {user?.role === 'Dokter' ? <DoctorDashboard user={user} /> : null}
            {/* </DashboardLayout> */}
          </ProtectedRoute>
        </Route>

        Patient Routes
        <Route path="/patient/profile">
          <ProtectedRoute allowedRoles={['Pasien']}>
          
              <PatientProfile user={user} />
          
          </ProtectedRoute>
        </Route>

        <Route path="/patient/appointments">
          <ProtectedRoute allowedRoles={['Pasien']}>
           
              <PatientAppointments user={user} />
        
          </ProtectedRoute>
        </Route>

        <Route path="/patient/medical-records">
          <ProtectedRoute allowedRoles={['Pasien']}>
           
              <PatientMedicalRecords user={user} />
     
          </ProtectedRoute>
        </Route>

        <Route path="/patient/prescriptions">
          <ProtectedRoute allowedRoles={['Pasien']}>
            
              <PatientPrescriptions user={user} />
     
          </ProtectedRoute>
        </Route>

        <Route path="/patient/bills">
          <ProtectedRoute allowedRoles={['Pasien']}>
           
              <PatientBills user={user} />
 
          </ProtectedRoute>
        </Route>

        {/* <Route path="/patient/payments">
          <ProtectedRoute allowedRoles={['Pasien']}>
            <DashboardLayout>
              <PatientPayments user={user} />
            </DashboardLayout>
          </ProtectedRoute>
        </Route> */}

        <Route path="/doctor/profile">
          <ProtectedRoute allowedRoles={['Dokter']}>
            
              <DoctorProfile user={user} />
        
          </ProtectedRoute>
        </Route>

        <Route path="/doctor/appointments">
          <ProtectedRoute allowedRoles={['Dokter']}>
           
              <DoctorAppointments user={user} />
          
          </ProtectedRoute>
        </Route>

        <Route path="/doctor/patients">
          <ProtectedRoute allowedRoles={['Dokter']}>
            
              <DoctorPatients user={user} />
           
          </ProtectedRoute>
        </Route>

        <Route path="/doctor/medical-records">
          <ProtectedRoute allowedRoles={['Dokter']}>
           
              <DoctorMedicalRecords user={user} />
          
          </ProtectedRoute>
        </Route>

        {/* <Route path="/doctor/prescriptions">
          <ProtectedRoute allowedRoles={['Dokter']}>
            <DashboardLayout>
              <DoctorPrescriptions user={user} />
            </DashboardLayout>
          </ProtectedRoute>
        </Route>  */}

        {/* <Route path="/doctor/ratings">
          <ProtectedRoute allowedRoles={['Dokter']}>
            <DashboardLayout>
              <DoctorRatings user={user} />
            </DashboardLayout>
          </ProtectedRoute>
        </Route> */}

        {/* 404 or Redirect */}
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;