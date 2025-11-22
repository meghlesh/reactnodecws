import React, { useEffect, useState } from "react";
import axios from "axios";

function AllEmployeeRegularizationRequestForAdmin({ showBackButton = true }) {
  const [regularizations, setRegularizations] = useState([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(" https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/attendance/regularization/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filtered = res.data.filter(
        (rec) =>
          rec?.regularizationRequest &&
          (rec.regularizationRequest.checkIn || rec.regularizationRequest.checkOut)
      );

      setRegularizations(filtered);

      // Calculate counts
      setApprovedCount(filtered.filter(r => r.regularizationRequest.status === "Approved").length);
      setRejectedCount(filtered.filter(r => r.regularizationRequest.status === "Rejected").length);
      setPendingCount(filtered.filter(r => r.regularizationRequest.status === "Pending").length);
    } catch (err) {
      console.error("Error fetching regularizations", err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        ` https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/attendance/regularization/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  // const formatTime = (dateString) =>
  //   dateString ? new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";

  // Pagination calculations
 
 

  
  const formatToIST = (utcDateString) => {
  const date = new Date(utcDateString);
  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
 
 
  const totalPages = Math.ceil(regularizations.length / itemsPerPage);
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, regularizations.length);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentRegularizations = regularizations.slice(indexOfFirstItem, indexOfLastItem);
console.log("currentRegularizations",currentRegularizations)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  console.log("regularizations", regularizations)

  return (
    <div className="container-fluid">
      <h3 className="mb-4 ms-3" style={{ color: "#3A5FBE", fontSize: "25px" }}>Regularization</h3>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body d-flex  align-items-center" style={{ gap: "20px" }}>
              <h4 className="mb-0" style={{ 
                  fontSize: "40px", 
                  backgroundColor: "#D7F5E4", 
                  padding: "10px",
                  textAlign: "center",
                  minWidth: "75px",      // Fixed minimum width
                  minHeight: "75px",     // Fixed minimum height
                  display: "flex",       // Center content
                  alignItems: "center",  // Center vertically
                  justifyContent: "center", // Center horizontally
                }}>
                {approvedCount}
              </h4>
              <p className="mb-0 fw-semibold" style={{ fontSize: "20px", color: "#3A5FBE" }}>Accepted Regularization Requests</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body d-flex  align-items-center" style={{ gap: "20px" }}>
              <h4 className="mb-0" style={{ 
                  fontSize: "40px", 
                  backgroundColor: "#F8D7DA", 
                  padding: "10px",
                  textAlign: "center",
                  minWidth: "75px",
                  minHeight: "75px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                
                }}>
                {rejectedCount}
              </h4>
              <p className="mb-0 fw-semibold" style={{ fontSize: "20px", color: "#3A5FBE" }}>Rejected Regularization Requests</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body d-flex  align-items-center" style={{ gap: "20px" }}>
              <h4 className="mb-0" style={{ 
                  fontSize: "40px", 
                  backgroundColor: "#FFE493", 
                  padding: "10px",
                  textAlign: "center",
                  minWidth: "75px",
                  minHeight: "75px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                
                }}>
                {pendingCount}
              </h4>
              <p className="mb-0 fw-semibold" style={{ fontSize: "20px", color: "#3A5FBE" }}>Pending Regularization Requests</p>
            </div>
          </div>
        </div>
      </div>

      {regularizations.length === 0 ? (
        <div className="alert alert-info">No regularization requests found.</div>
      ) : (
        <>
          <div className="card shadow-sm border-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Name</th>
                    <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }} >Date</th>
                    <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }} >Check-In</th>
                    <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }} >Check-Out</th>
                    <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Mode</th>
                    <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }} >Status</th>
                    <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRegularizations.map((rec) => {
                    // const checkInTime = rec.checkIn || rec?.regularizationRequest?.checkIn;
                    // const checkOutTime = rec.checkOut || rec?.regularizationRequest?.checkOut;
                    const checkInTime =
                      rec?.regularizationRequest?.checkIn || rec?.checkIn;
                    const checkOutTime =
                      rec?.regularizationRequest?.checkOut || rec?.checkOut;

                    console.log("rec", rec)
                    return (
                      <tr key={rec._id} className="align-middle">
                        <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                          {rec?.employee?.name
                            ? rec.employee.name
                              .split(" ")
                              .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                              .join(" ")
                            : ""}
                        </td>
                        <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{new Date(rec.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{formatToIST(checkInTime)}</td>
                        <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{formatToIST(checkOutTime)}</td>
                        <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{rec.mode}</td>
                        <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                          {rec?.regularizationRequest?.status === "Approved" ? (
                            <span style={{ backgroundColor: '#d1f2dd', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>Approved</span>
                          ) : rec?.regularizationRequest?.status === "Rejected" ? (
                            <span style={{ backgroundColor: '#f8d7da', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>Rejected</span>
                          ) : (
                            <span style={{ backgroundColor: '#FFE493', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>Pending</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                          {rec?.regularizationRequest?.status === "Pending" && (
                            <>
                              <button className="btn btn-sm btn-outline-success me-2" onClick={() => handleStatusChange(rec._id, "Approved")}>Approve</button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleStatusChange(rec._id, "Rejected")}>Reject</button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <nav className="d-flex align-items-center justify-content-end mt-3 text-muted">
            <div className="d-flex align-items-center gap-3">
              {/* Rows per page */}
              <div className="d-flex align-items-center">
                <span style={{ fontSize: "14px", marginRight: "8px" }}>Rows per page:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto", fontSize: "14px" }}
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

              {/* Range display */}
              <span style={{ fontSize: "14px", marginLeft: "16px" }}>
                {indexOfFirstItem + 1}-{indexOfLastItem} of {regularizations.length}
              </span>

              {/* Navigation arrows */}
              <div className="d-flex align-items-center" style={{ marginLeft: "16px" }}>
                <button
                  className="btn btn-sm border-0"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{ fontSize: "18px", padding: "2px 8px" }}
                >
                  ‹
                </button>
                <button
                  className="btn btn-sm border-0"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{ fontSize: "18px", padding: "2px 8px" }}
                >
                  ›
                </button>
              </div>
            </div>
          </nav>

          {/* <div className="text-end mt-3">
        <button
          className="btn btn-primary mt-3"
        
          onClick={() => window.history.go(-1)}
        >
          ← Back
        </button>
      </div> */}

          {showBackButton && (
            <div className="text-end mt-3">
              <button
                className="btn btn-primary mt-3"
                style={{ backgroundColor: "#3A5FBE", borderColor: "#3A5FBE" }}
                onClick={() => window.history.go(-1)}
              >
                Back
              </button>
            </div>
          )}

        </>
      )}
    </div>
  );
}

export default AllEmployeeRegularizationRequestForAdmin;
