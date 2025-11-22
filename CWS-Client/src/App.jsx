// import { useEffect, useState } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import EmployeeVerify from "./assets/LoginRegistration/EmployeeVerify";
// import AddEmployee from "./assets/LoginRegistration/AddEmployee";
// import Login from "./assets/LoginRegistration/Login";
// import ProtectedRoute from "./ProtectedRoute";
// import Dashboard from "./assets/AllDashboards/Dashboard";
// import PasswordReset from "./assets/LoginRegistration/PasswordReset";
// import ForgotPassword from "./assets/LoginRegistration/ForgotPassword";
// import BackButton from "./BackButton";

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(null);
// console.log("App rendered");

//   // useEffect(() => {
//   //   const token = localStorage.getItem("accessToken");
//   //   setIsLoggedIn(!!token);
//   // }, []);

//   useEffect(() => {
//   const checkLogin = () => {
//     const token = localStorage.getItem("accessToken");
//     setIsLoggedIn(!!token);
//   };

//   checkLogin();

//   // Watch for manual storage changes (logout, another tab, etc.)
//   window.addEventListener("storage", checkLogin);

//   return () => {
//     window.removeEventListener("storage", checkLogin);
//   };
// }, []);

//   // if (isLoggedIn === null) {
//   //   return <div>Loading...</div>;
//   // }

//   if (isLoggedIn === null) {
//   return (
//     <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
//       <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
//         <span className="visually-hidden">Loading...</span>
//       </div>
//       <p className="mt-3 fw-semibold text-primary">Checking session...</p>
//     </div>
//   );
// }


//   // ✅ Simple 404 Page
// function NotFound() {
//   return (
//     <div style={{ textAlign: "center", marginTop: "50px" }}>
//       <h1>404 - Page Not Found</h1>
//       <p>The page you are looking for doesn't exist.</p>
//       <a href="/login" style={{ color: "#007bff" }}>Go to Login</a>
//       <BackButton/>
//     </div>
    
//   );
// }


//   return (
//     <Router>
//       <Routes>
//         <Route
//           path="/login"
//           element={isLoggedIn ? <Navigate
//         to={`/dashboard/${localStorage.getItem("role")}/${localStorage.getItem("username")}/${localStorage.getItem("id")}`}
//         replace
//       />

//              : <Login />}
//         />
//         {/* <Route path="/admin/add-employee" element={<AddEmployee />} /> */}
//         <Route path="/employee/verify/:id/:token" element={<EmployeeVerify />} />

//         {/* ✅ Only one main dashboard route */}
//         <Route
//           path="/dashboard/:role/:username/:id/*"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/password-reset"
//           element={isLoggedIn ? <Navigate to="/login" replace /> : <PasswordReset />}
//         />
//         <Route path="/forgotpassword/:id/:token" element={<ForgotPassword />} />

//          {/* ✅ Catch-all 404 route */}
//        <Route path="*" element={<Navigate to="/login" replace />} />


//       </Routes>
//     </Router>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import EmployeeVerify from "./assets/LoginRegistration/EmployeeVerify";
import AddEmployee from "./assets/LoginRegistration/AddEmployee";
import Login from "./assets/LoginRegistration/Login";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./assets/AllDashboards/Dashboard";
import PasswordReset from "./assets/LoginRegistration/PasswordReset";
import ForgotPassword from "./assets/LoginRegistration/ForgotPassword";
import BackButton from "./BackButton";

function App() {
  console.log("App rendered");

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/employee/verify/:id/:token" element={<EmployeeVerify />} />
        <Route path="/forgotpassword/:id/:token" element={<ForgotPassword />} />
        <Route path="/password-reset" element={<PasswordReset />} />

        {/* Protected Route */}
        <Route
          path="/dashboard/:role/:username/:id/*"
          element={
            <ProtectedRoute allowedRoles={["admin", "employee", "manager", "hr","ceo"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 or fallback route */}
        <Route
          path="*"
          element={
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <h1>404 - Page Not Found</h1>
              <p>The page you are looking for doesn't exist.</p>
              <a href="/login" style={{ color: "#007bff" }}>Go to Login</a><br/>
              <BackButton />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
