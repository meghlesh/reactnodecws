import React, { useEffect, useState } from "react";
import axios from "axios";

function ManagerDashboard({ user }) {
  const [leaves, setLeaves] = useState([]);
  const [regularizations, setRegularizations] = useState([]);
  const [loading, setLoading] = useState(true);
  // change date format
  const df = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }); // "31 Dec 2025" [web:9][web:20][web:1]

  // Pagination states
  const [leavePage, setLeavePage] = useState(1);
  const [regPage, setRegPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    if (!user?._id) return;

    const fetchData = async () => {
      try {
        const leavesRes = await axios.get(
          ` https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/leaves/manager/${user._id}`
        );
        setLeaves(leavesRes.data);

        const regRes = await axios.get(
          ` https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/regularization/manager/${user._id}`
        );
        setRegularizations(regRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // ===== Update Leave Status =====
  const updateLeaveStatus = async (leaveId, status) => {
    try {
      const res = await axios.put(
        ` https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/leave/${leaveId}/status`,
        {
          status,
          userId: user._id,
          role: "manager",
        }
      );
      const updatedLeave = res.data.leave;
      setLeaves((prev) =>
        prev.map((l) => (l._id === leaveId ? { ...l, ...updatedLeave } : l))
      );
    } catch (err) {
      console.error("Error updating leave status:", err);
    }
  };

  // ===== Update Regularization Status =====
  const updateRegularizationStatus = async (attendanceId, status) => {
    try {
      const res = await axios.put(
        ` https://api-nodelinux-be-b8cpf8cbe8f4f5b0.centralus-01.azurewebsites.net/attendance/regularization/${attendanceId}/status`,
        {
          status,
          approvedBy: user._id,
          approvedByRole: "manager",
          approvedByName: user.name,
        }
      );
      const updatedRecord = res.data.attendance;
      setRegularizations((prev) =>
        prev.map((r) => (r._id === attendanceId ? updatedRecord : r))
      );
    } catch (err) {
      console.error("Error updating regularization status:", err);
    }
  };

  // if (loading) return <p>Loading data...</p>;
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
    <p className="mt-3 fw-semibold" style={{ color: "#3A5FBE" }}>Loading ...</p>
  </div>

  // ===== Pagination Logic =====
  const totalLeavePages = Math.ceil(leaves.length / itemsPerPage);
  const totalRegPages = Math.ceil(regularizations.length / itemsPerPage);

  const indexOfLastLeave = leavePage * itemsPerPage;
  const indexOfFirstLeave = indexOfLastLeave - itemsPerPage;
  const paginatedLeaves = leaves.slice(indexOfFirstLeave, indexOfLastLeave);

  const indexOfLastReg = regPage * itemsPerPage;
  const indexOfFirstReg = indexOfLastReg - itemsPerPage;
  const paginatedRegularizations = regularizations.slice(
    indexOfFirstReg,
    indexOfLastReg
  );

  // ===== Pagination Component =====
  const renderPagination = (
    currentPage,
    totalPages,
    totalItems,
    indexOfFirstItem,
    indexOfLastItem,
    setPage
  ) => (
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
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>

        {/* Page range display */}
        <span style={{ fontSize: "14px", marginLeft: "16px" }}>
          {totalItems === 0
            ? "0–0 of 0"
            : `${indexOfFirstItem + 1}-${Math.min(
              indexOfLastItem,
              totalItems
            )} of ${totalItems}`}
        </span>

        {/* Navigation arrows */}
        <div
          className="d-flex align-items-center"
          style={{ marginLeft: "16px" }}
        >
          <button
            className="btn btn-sm border-0"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ fontSize: "18px", padding: "2px 8px" }}
          >
            ‹
          </button>
          <button
            className="btn btn-sm border-0"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ fontSize: "18px", padding: "2px 8px" }}
          >
            ›
          </button>
        </div>
      </div>
    </nav>
  );


  console.log(paginatedRegularizations)
  console.log("paginatedLeaves", paginatedLeaves)

  {/* Add helper function at the top of component (below imports) */}
const formatToIST = (utcDateString) => {
  if (!utcDateString) return "-";
  const date = new Date(utcDateString);
  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24-hour format
  });
};

  return (
    <div className="container mt-4">
      {/* ==================== Leave Requests ==================== */}
      <h2 style={{ color: "#3A5FBE", marginTop: "-30px", fontSize: "25px" }}>Leave Requests Assigned to You</h2>
      {leaves.length === 0 ? (
        <p>No leaves assigned to you.</p>
      ) : (
        <>
          <div
            className="table-responsive mt-3 "
            style={{
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              borderRadius: "8px",
            }}
          >
            <table className="table table-hover mb-0" style={{ borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>

                <tr>
                  <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Employee</th>
                  <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Leave Type</th>
                  <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>From</th>
                  <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>To</th>
                  <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Duration</th>
                  <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Reason</th>
                  <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {[...paginatedLeaves]
                  .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)).map((l) => (
                    <tr key={l._id}>
                      <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{l.employee?.name}</td>
                      <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{l.leaveType}</td>
                      <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{df.format(new Date(l.dateFrom))}</td>
                      <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{df.format(new Date(l.dateTo))}</td>
                      <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{l.duration}</td>
                      {/* <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{l.reason}</td> */}

                      <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap', maxWidth: '220px', wordBreak: 'break-word', overflow: 'auto' }}>{l.reason}</td>
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
                          <span style={{ backgroundColor: '#fff3cd', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>
                            Pending
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                        {l.status === "pending" ? (
                          <>
                            <button
                              className="btn btn-sm btn-outline-success me-2"
                              onClick={() => updateLeaveStatus(l._id, "approved")}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => updateLeaveStatus(l._id, "rejected")}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {/* Pagination bar for Leave Table */}
          {renderPagination(
            leavePage,
            totalLeavePages,
            leaves.length,
            indexOfFirstLeave,
            indexOfLastLeave,
            setLeavePage
          )}
        </>
      )}

      {/* ==================== Regularization Requests ==================== */}
      <h2 style={{ color: "#3A5FBE", marginTop: "-30px", fontSize: "25px" }} className="mt-5">Regularization Requests Assigned to You</h2>
      {regularizations.length === 0 ? (
        <p>No regularization requests assigned to you.</p>
      ) : (
        <>
          <div
            className="table-responsive mt-3 "
            style={{
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              borderRadius: "8px",
            }}
          >
            <table className="table table-hover mb-0" style={{ borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>

                <tr>
                  <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Employee</th>
                  <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Date</th>
                  <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Check-In</th>
                  <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Check-Out</th>
                  <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Mode</th>
                  <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Status</th>
                  {/* <th>Requested At</th>
                <th>Reviewed By</th> */}
                  <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRegularizations.map((r) => (
                  <tr key={r._id}>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{r.employee?.name}</td>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{df.format(new Date(r.date))}</td>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                      {/* {r.regularizationRequest.checkIn
                        ? new Date(r.regularizationRequest.checkIn).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true, // uncomment for 24-hour clock, e.g., 17:05
                        }).toUpperCase()
                        : "-"} */}

                         {formatToIST(r?.regularizationRequest?.checkIn)}
                    </td>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                      {/* {r.regularizationRequest.checkOut
                        ? new Date(r.regularizationRequest.checkOut).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true, // uncomment for 24-hour clock, e.g., 17:05
                        }).toUpperCase()
                        : "-"} */}

                        {formatToIST(r?.regularizationRequest?.checkOut)}
                    </td>

                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{r.mode}</td>
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                      {r?.regularizationRequest?.status === "Approved" ? (
                        <span style={{ backgroundColor: '#d1f2dd', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>
                          Approved
                        </span>
                      ) : r?.regularizationRequest?.status === "Rejected" ? (
                        <span style={{ backgroundColor: '#f8d7da', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>
                          Rejected
                        </span>
                      ) : r?.regularizationRequest?.status === "Pending" ? (
                        <span style={{ backgroundColor: '#fff3cd', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>
                          Pending
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-dark px-3 py-2">
                          N/A
                        </span>
                      )}
                    </td>
                    {/* <td>
                    {r.regularizationRequest.requestedAt
                      ? new Date(
                          r.regularizationRequest.requestedAt
                        ).toLocaleString()
                      : "-"}
                  </td>
                  <td>{r.regularizationRequest.approvedByName || "-"}</td> */}
                    <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                      {r.regularizationRequest.status === "Pending" ? (
                        <>
                          <button
                            className="btn btn-sm btn-outline-success me-2"
                            onClick={() =>
                              updateRegularizationStatus(r._id, "Approved")
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              updateRegularizationStatus(r._id, "Rejected")
                            }
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination bar for Regularization Table */}
          {renderPagination(
            regPage,
            totalRegPages,
            regularizations.length,
            indexOfFirstReg,
            indexOfLastReg,
            setRegPage
          )}
        </>
      )}
    </div>
  );
}

export default ManagerDashboard;
