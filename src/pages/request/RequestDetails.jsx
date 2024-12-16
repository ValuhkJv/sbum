import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const DetailPermintaan = () => {
  const { date } = useParams();
  const [details, setDetails] = useState([]);
  const userId = localStorage.getItem("user_id");
  const formattedDate = new Date(date).toLocaleDateString("en-CA"); // Hanya ambil bagian tanggalnya saja

  useEffect(() => {
    if (userId) {
      axios
        .get(
          `http://localhost:5000/requests/detail/${formattedDate}?user_id=${userId}`
        )

        .then((res) => {
          setDetails(res.data);
        })
        .catch((err) => console.error("Error fetching details:", err));
    }
  }, [formattedDate, userId]);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Detail Permintaan Tanggal {formattedDate}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>No</TableCell>
            <TableCell>Nama Peminta</TableCell>
            <TableCell>Nama Barang</TableCell>
            <TableCell>Satuan</TableCell>
            <TableCell>Jumlah</TableCell>
            <TableCell>Alasan Permintaan</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Alasan Penolakan</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {details.map((detail, index) => (
            <TableRow key={detail.request_id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{detail.requested_by}</TableCell>
              <TableCell>{detail.item_name}</TableCell>
              <TableCell>{detail.unit}</TableCell>
              <TableCell>{detail.quantity}</TableCell>
              <TableCell>{detail.reason}</TableCell>
              <TableCell>{detail.status}</TableCell>
              <TableCell>{detail.rejection_reason || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DetailPermintaan;
