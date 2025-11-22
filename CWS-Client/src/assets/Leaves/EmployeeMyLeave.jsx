import React, { useEffect, useState } from "react";
import axios from "axios";

function EmployeeMyLeave({ user, refreshKey }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Pagination state as React state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // <-- FIXED

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await axios.get(
          ` https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/leave/my/${user._id}`
        );
        //const leavesData = res.data;
        // ✅ Sort by createdAt (or appliedAt) descending
        const leavesData = res.data.sort(
          (a, b) => new Date(b.createdAt || b.appliedAt) - new Date(a.createdAt || a.appliedAt)
        );

        // Attach manager name
        const leavesWithNames = await Promise.all(
          leavesData.map(async (leave) => {
            let managerName = "N/A";
            if (leave.reportingManager) {
              try {
                const mgrRes = await axios.get(
                  ` https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/users/${leave.reportingManager}`
                );
                managerName = mgrRes.data.name;
              } catch (err) {
                console.error("Error fetching manager:", err);
              }
            }
            return { ...leave, reportingManagerName: managerName };
          })
        );

        setLeaves(leavesWithNames);
      } catch (err) {
        console.error("Error fetching leaves:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [user, refreshKey]);
  

  // ✅ Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeaves = leaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(leaves.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // if (loading) return <p>Loading leaves...</p>;


if (loading) {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center mt-5"
      // style={{ minHeight: "100vh" }}
      style={{ height: "100vh", // Changed from minHeight to height
        width: "100%",
        position: "absolute",
        top: 0,
        left: 0
        }}
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


  if (leaves.length === 0) return <p>No leave applications found.</p>;

  return (
    <div>
      <div
        className="table-responsive mt-3"
        style={{
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          borderRadius: "8px",
        }}
      >
        <table className="table table-hover mb-0">
          <thead style={{ backgroundColor: "#f8f9fa" }}>
            <tr>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Leave Type</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>From</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>To</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Days</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Reason</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Approver</th>
            </tr>
          </thead>
          <tbody>
            {currentLeaves.map((l) => (
              <tr key={l._id}>
                <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{l.leaveType}</td>
                <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                  {new Date(l.dateFrom).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                  {new Date(l.dateTo).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                  {l.duration === "half"
                    ? 0.5
                    : Math.floor(
                      (new Date(l.dateTo) - new Date(l.dateFrom)) /
                      (1000 * 60 * 60 * 24)
                    ) + 1}
                </td>
                <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                  {l.status === "approved" ? (
                    <span style={{ backgroundColor: '#d1f2dd', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>
                      Approved
                    </span>
                  ) : l.status === "rejected" ? (
                    <span style={{ backgroundColor: '#f8d7da', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>
                      Rejected
                    </span>
                  ) : (
                    <span style={{ backgroundColor: '#FFE493', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>
                      Pending
                    </span>
                  )}
                </td>
      <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap', maxWidth: '220px', wordBreak: 'break-word', overflow: 'auto' }}>{l.reason}</td>
                <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{l.reportingManagerName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination controls */}
      <nav className="d-flex align-items-center justify-content-end mt-3 text-muted">
        <div className="d-flex align-items-center gap-3">
          {/* Rows per page dropdown */}
          <div className="d-flex align-items-center">
            <span style={{ fontSize: "14px", marginRight: "8px" }}>
              Rows per page:
            </span>
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

          {/* Page range display */}
          <span style={{ fontSize: "14px", marginLeft: "16px" }}>
            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, leaves.length)} of{" "}
            {leaves.length}
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

export default EmployeeMyLeave;
