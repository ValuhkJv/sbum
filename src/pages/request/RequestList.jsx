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

const RequestList = ({ userId }) => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  const StyledTableCell = styled(TableCell)({
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "left",
    wordWrap: "break-word",
  });

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      console.error("User ID is required!");
      return;
    }
    axios
      .get(`http://localhost:5000/requests?user_id=${userId}`)
      .then((response) => setRequests(response.data))
      .catch((error) => console.error("Error fetching requests:", error));
  }, [userId]);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Data Permintaan Barang
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/request")}
        disabled={
          requests.filter(
            (req) =>
              new Date(req.request_date).toDateString() ===
              new Date().toDateString()
          ).length >= 5
        }
      >
        Tambahkan Permintaan Barang
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell>No</StyledTableCell>
            <StyledTableCell>Tanggal Permintaan</StyledTableCell>
            <StyledTableCell>Jumlah Permintaan</StyledTableCell>
            <StyledTableCell>Aksi</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request, index) => (
            <TableRow key={request.date}>
              <StyledTableCell>{index + 1}</StyledTableCell>
              <StyledTableCell>
                {new Date(request.date).toLocaleDateString()}
              </StyledTableCell>
              <StyledTableCell>{request.total_requests}</StyledTableCell>
              <StyledTableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/DetailPermintaan/${request.date}`)}
                >
                  Detail Permintaan
                </Button>
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RequestList;
