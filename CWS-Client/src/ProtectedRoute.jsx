// // import React from "react";
// // import { Navigate } from "react-router-dom";

// // const ProtectedRoute = ({ children }) => {
// //   const token = localStorage.getItem("accessToken");  //match storage key

// //   if (!token) {
// //     return <Navigate to="/login" replace />;
// //   }

// //   return children;
// // };

// // export default ProtectedRoute;



// import { Navigate } from "react-router-dom";

// function ProtectedRoute({ children, allowedRoles }) {
//   const token = localStorage.getItem("accessToken");
//   const role = localStorage.getItem("role");
// console.log("ProtectedRoute rendered");

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   if (allowedRoles && !allowedRoles.includes(role)) {
//     return <Navigate to="/login" replace />; // or show 403 page
//   }

//   return children;
// }

// export default ProtectedRoute;
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  if (!token) {
    console.log("🔒 Redirecting: no token");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    console.log("🔒 Redirecting: unauthorized role",role);
    return <Navigate to="/login" replace />;
  }

  console.log("✅ ProtectedRoute rendered normally");
  return children;
}

export default ProtectedRoute;
