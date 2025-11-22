import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate,useParams } from "react-router-dom";
import EmployeeProfileForAdmin from "./EmployeeMyProfileForAdmin";
import AddEmployee from "../LoginRegistration/AddEmployee";

function AllEmployeeDetails() {
  const [employees, setEmployees] = useState([]);
  const [managersList, setManagersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [message, setMessage] = useState("");
  const [viewEmployee, setViewEmployee] = useState(null);

  const userRole = localStorage.getItem("role"); // e.g. "admin", "hr", "manager"
  
    const { role, username, id } = useParams();
  
  //soft delete
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/soft/deleteEmployee/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
      alert("Employee deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error deleting employee. Please try again.");
    }
  };


  // //permanent delete
  // const handleDeleteEmployeepermanent = async (id) => {
  //   if (!window.confirm("⚠️ Are you sure you want to permanently delete this employee? This action cannot be undone.")) {
  //     return;
  //   }

  //   try {
  //     const token = localStorage.getItem("accessToken");
  //     const res = await axios.delete(` https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/deleteEmployee/${id}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     if (res.data.success) {
  //       // Remove employee from local state immediately
  //       setEmployees((prev) => prev.filter((emp) => emp._id !== id));
  //       alert("✅ Employee permanently deleted!");
  //     } else {
  //       alert("❌ Failed to delete employee.");
  //     }
  //   } catch (error) {
  //     console.error("Error deleting employee:", error);
  //     alert("Server error while deleting employee.");
  //   }
  // };

const handleDeleteEmployeepermanent = async (id) => {
  if (
    !window.confirm(
      "⚠️ Are you sure you want to permanently delete this employee? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const token = localStorage.getItem("accessToken");
    const res = await axios.delete(`https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/deleteEmployee/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Delete Response:", res.data); // ✅ Debug line

    if (res.data.success) {
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
      alert("✅ Employee permanently deleted!");
    } else {
      alert("❌ Failed to delete employee.");
    }
  } catch (error) {
    console.error("Error deleting employee:", error.response?.data || error.message);
    alert("Server error while deleting employee.");
  }
};


  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const navigate = useNavigate();

  // Fetch all employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get("https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/getAllEmployees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch employees.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Handle Assign Manager
  const handleAssignManagerClick = (emp) => {
    setSelectedEmployee(emp);
    setSelectedManagerId(emp.reportingManager?._id || "");
    const managers = employees.filter(
      (e) => e.role === "manager" && e._id !== emp._id
    );
    setManagersList(managers);
    setShowModal(true);
    setMessage("");
  };

  const handleUpdateManager = async () => {
    if (!selectedManagerId) {
      setMessage("Please select a manager.");
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/users/${selectedEmployee._id}/assign-manager`,
        { managerId: selectedManagerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const managerObj = managersList.find((m) => m._id === selectedManagerId);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === selectedEmployee._id
            ? { ...emp, reportingManager: managerObj }
            : emp
        )
      );

      setMessage("Manager assigned successfully!");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setMessage("Error assigning manager.");
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = employees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

 
if (loading) {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="spinner-grow"
        role="status"
        style={{ width: "4rem", height: "4rem", color: "#3A5FBE" }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 fw-semibold" style={{ color: "#3A5FBE" }}>
        Loading ...
      </p>
    </div>
  );
}


  if (error) return <p className="text-danger text-center mt-3">{error}</p>;

  // Render employee profile if viewEmployee is set
  if (viewEmployee) {
    return (
      <EmployeeProfileForAdmin
        employee={viewEmployee}
        onBack={() => setViewEmployee(null)}
      />
    );
  }

  return (

    <div className="container p-4">
      <h4 className="mb-3" style={{ color: "#3A5FBE", fontSize: "25px" }}>All Employee Details</h4>
      {/* <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        ⬅ Back
      </button> */}

      {userRole === "admin" && <AddEmployee />}

      <div className="table-responsive mt-2">
        <table className="table table-hover mb-0" style={{ borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f8f9fa" }}>
            <tr>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px' }}>Name</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px' }}>Email</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px' }}>Department</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px' }}>Position</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px' }}>Date Of Joining</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentEmployees.map((emp) => (
              <tr key={emp._id}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.department || "N/A"}</td>
                <td className="text-capitalize">{emp.role}</td>
                <td>{new Date(emp.doj || emp.createdAt).toLocaleDateString()}</td>
                <td style={{ display: "flex", gap: "5px" }}>
                  {userRole === "admin" && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteEmployee(emp._id)}
                    >
                      soft Delete
                    </button>

                  )}
                  {userRole === "admin" && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteEmployeepermanent(emp._id)}
                    >
                      Delete
                    </button>
                  )}

                  {/* <button
                    className="btn btn-sm"
                    style={{ backgroundColor: "#3A5FBE", color: "#fff" }}
                    onClick={() => setViewEmployee(emp)}
                  >
                    View
                  </button> */}

                  <NavLink
  to={`/dashboard/${role}/${username}/${id}/employeeprofile/${emp._id}`}
  className="btn btn-sm"
  style={{ backgroundColor: "#3A5FBE", color: "#fff" }}
>
  View
</NavLink>


                  {/* <button
                      className="btn btn-sm btn-primary"
                    onClick={() => handleAssignManagerClick(emp)}
                  >
                    Assign Manager
                  </button> */}
                  {userRole === "admin" && (
                    <button
                      className="btn btn-sm"
                      style={{ backgroundColor: "#3A5FBE", color: "#fff" }}
                      onClick={() => handleAssignManagerClick(emp)}

                    >
                      Assign Manager
                    </button>
                  )}

                  {/* {emp.reportingManager && (
                    <p className="mt-1 mb-0 text-muted">
                      Current: {emp.reportingManager.name} - {emp.reportingManager.designation}
                    </p>
                  )} */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Custom Pagination */}
      <nav className="d-flex align-items-center justify-content-end mt-3 text-muted">
        <div className="d-flex align-items-center gap-3">
          {/* Rows per page dropdown */}
          <div className="d-flex align-items-center">
            <span style={{ fontSize: '14px', marginRight: '8px' }}>Rows per page:</span>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto', fontSize: '14px' }}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>

          {/* Page range display */}
          <span style={{ fontSize: '14px', marginLeft: '16px' }}>
            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, employees.length)} of {employees.length}
          </span>

          {/* Navigation arrows */}
          <div className="d-flex align-items-center" style={{ marginLeft: '16px' }}>
            <button
              className="btn btn-sm border-0"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ fontSize: '18px', padding: '2px 8px' }}
            >
              ‹
            </button>
            <button
              className="btn btn-sm border-0"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ fontSize: '18px', padding: '2px 8px' }}
            >
              ›
            </button>
          </div>
        </div>
      </nav>

      {/* Modal for assigning manager */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: "#233986", borderColor: "#233986", color: "#fff" }}>
                <h5 className="modal-title">Assign Reporting Manager</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {message && <div className="alert alert-info">{message}</div>}
                <div className="mb-3">
                  <label style={{ color: "#0d47a1", fontWeight: "bold" }}>Manager</label>
                  <select
                    className="form-select mt-2"
                    value={selectedManagerId}
                    onChange={(e) => setSelectedManagerId(e.target.value)}
                  >
                    <option value="">Select Manager</option>
                    {managersList.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} - {m.designation} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}
                    style={{ borderColor: "#233986", color: "#233986", fontWeight: "bold" }}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleUpdateManager}
                    style={{ backgroundColor: "#233986", borderColor: "#233986", color: "#fff" }}>
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

<div className="text-end mt-3">
       <button
  className="btn btn-primary mt-3"
  style={{ backgroundColor: "#3A5FBE", borderColor: "#3A5FBE" }}
  onClick={() => window.history.go(-1)}
>
  Back
</button>
</div>
      
    </div>
  );
}

export default AllEmployeeDetails;
