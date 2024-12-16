import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RequestApprovalAdmin = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const division = localStorage.getItem("division_name"); // Divisi kepala unit

  const StyledTableCell = styled(TableCell)({
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "left",
    wordWrap: "break-word",
  });

  useEffect(() => {
    axios
      .get(`http://localhost:5000/requests/head-approval?division=${division}`)
      .then((res) => setRequests(res.data))
      .catch((err) => console.error(err));
  }, [division]);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Data Permintaan Barang
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell>No</StyledTableCell>
            <StyledTableCell>Nama</StyledTableCell>
            <StyledTableCell>Jumlah Permintaan</StyledTableCell>
            <StyledTableCell>Tanggal Permintaan</StyledTableCell>
            <StyledTableCell>Divisi</StyledTableCell>
            <StyledTableCell>Aksi</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((req, index) => (
            <TableRow key={req.user_id}>
              <StyledTableCell>{index + 1}</StyledTableCell>
              <StyledTableCell>{req.full_name}</StyledTableCell>
              <StyledTableCell>{req.total_requests}</StyledTableCell>
              <StyledTableCell>
                {new Date(req.created_at).toLocaleDateString()}
              </StyledTableCell>

              <StyledTableCell>{req.division_name}</StyledTableCell>
              <StyledTableCell>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/requests/${req.request_id}`)}
                >
                  Detail
                </Button>
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RequestApprovalAdmin;
