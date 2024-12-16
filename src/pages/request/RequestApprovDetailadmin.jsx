import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
} from "@mui/material";

const DetailPersetujuan = () => {
  const { request_id } = useParams(); // request_id permintaan
  const [details, setDetails] = useState([]); // Data detail barang
  const [status, setStatus] = useState(""); // Status aksi
  const [reason, setReason] = useState(""); // Alasan jika ditolak
  useEffect(() => {
    axios
      .get(`http://localhost:5000/requests/${request_id}/admin-approval`)
      .then((res) => setDetails(res.data))
      .catch((err) => console.error(err));
  }, [request_id]);

  const handleApproval = (approvalStatus) => {
    const payload = {
      status: approvalStatus,
      rejection_reason: approvalStatus === "rejected_by_admin" ? reason : null,
    };

    axios
      .put(
        `http://localhost:5000/requests/${request_id}/head-approval`,
        payload
      )
      .then(() => alert("Permintaan berhasil diperbarui."))
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h2>Detail Persetujuan</h2>
      {/* Tabel Detail Permintaan */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>No</TableCell>
            <TableCell>Nama Barang</TableCell>
            <TableCell>Jumlah</TableCell>
            <TableCell>Alasan</TableCell>
            <TableCell>Divisi</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Aksi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {details.map((item, index) => (
            <TableRow key={item.request_id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.item_name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.reason}</TableCell>
              <TableCell>{item.user_division}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>
                {/* Tombol Persetujuan */}
                <div style={{ marginTop: "20px" }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleApproval("approved_by_admin")}
                  >
                    Setujui
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    style={{ marginLeft: "10px" }}
                    onClick={() => setStatus("rejected_by_admin")}
                  >
                    Tolak
                  </Button>
                </div>

                {/* Input Alasan Penolakan */}
                {status === "rejected_by_admin" && (
                  <div style={{ marginTop: "20px" }}>
                    <TextField
                      fullWrequest_idth
                      label="Alasan Penolakan"
                      variant="outlined"
                      multiline
                      rows={3}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ marginTop: "10px" }}
                      onClick={() => handleApproval("rejected_by_admin")}
                    >
                      Kirim
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DetailPersetujuan;
