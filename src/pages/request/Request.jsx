import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Box,
  Paper,
} from "@mui/material";
import axios from "axios";

const RequestForm = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({
    category_id: "",
    item_id: "",
    quantity: "",
    reason: "",
    stock: "",
  });
  const [userData, setUserData] = useState({
    name: "",
    division_name: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("user_id"); // Atau dari session atau token JWT
      if (userId) {
        try {
          const userResponse = await axios.get(
            `http://localhost:5000/users/${userId}`
          ); // Sesuaikan user_id
          setUserData({
            full_name: localStorage.getItem("full_name"),
            division_name: userResponse.data.division_name,
            division_id: userResponse.data.division_id,
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  // Fetch categories on component mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/categories")
      .then((response) => setCategories(response.data));
  }, []);

  // Fetch items when category changes
  useEffect(() => {
    if (formData.category_id) {
      console.log("Category ID:", formData.category_id);
      axios
        .get(`http://localhost:5000/items?category_id=${formData.category_id}`)
        .then((response) => {
          console.log("Items:", response.data);
          setItems(response.data);
        })
        .catch((error) => {
          console.error("Error fetching items:", error);
        });
    }
  }, [formData.category_id]);

  // Fetch stock of selected item
  useEffect(() => {
    if (formData.item_id) {
      const selectedItem = items.find(
        (item) => item.item_id === formData.item_id
      );
      setFormData((prev) => ({ ...prev, stock: selectedItem?.stock || "" }));
    }
  }, [formData.item_id, items]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addRequest = () => {
    const selectedItem = items.find(
      (item) => item.item_id === formData.item_id
    );

    if (requests.length < 3) {
      if (parseInt(formData.quantity) > parseInt(selectedItem.stock)) {
        alert("Jumlah barang melebihi stok yang tersedia!");
        return;
      }

      setRequests([
        ...requests,
        {
          item_id: selectedItem.item_id,
          item_name: selectedItem.item_name,
          category_name: selectedItem.category_name,
          quantity: formData.quantity,
          reason: formData.reason,
          stock: selectedItem.stock,
        },
      ]);

      // Reset form
      setFormData({
        category_id: "",
        item_id: "",
        quantity: "",
        reason: "",
        stock: "",
      });
    } else {
      alert("Maksimal 3 barang per permintaan!");
    }
  };

  const handleSubmit = () => {
    const userId = localStorage.getItem("user_id");
    const payload = {
      user_id: userId,
      requests: requests.map((req) => ({
        item_id: req.item_id,
        quantity: req.quantity,
        reason: req.reason,
        category_name: req.category_name,
      })),
    };
    console.log("Payload:", payload);

    axios
      .post("http://localhost:5000/requests/batch", payload)
      .then(() => {
        alert("Permintaan berhasil diajukan!");
        setRequests([]);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <Box sx={{ padding: 2 }}>
        <Paper elevation={3} sx={{ padding: 3 }}>
          <Typography variant="h4" gutterBottom>
            Form Permintaan Barang
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                id="name"
                label="Nama"
                value={userData.full_name || ""}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                id="division_id"
                label="Division"
                value={userData.division_name || ""}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                fullWidth
                displayEmpty
              >
                <MenuItem value="">-- Pilih Kategori --</MenuItem>
                {categories.map((category) => (
                  <MenuItem
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.category_name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                name="item_id"
                value={formData.item_id}
                onChange={handleChange}
                fullWidth
                displayEmpty
                disabled={!formData.category_id}
              >
                <MenuItem value="">-- Pilih Barang --</MenuItem>
                {items.length > 0 ? (
                  items.map((item) => (
                    <MenuItem key={item.item_id} value={item.item_id}>
                      {item.item_name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    No items available
                  </MenuItem>
                )}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Stok Barang"
                name="stock"
                value={formData.stock}
                fullWidth
                InputProps={{
                  readOnly: true, // agar hanya untuk tampilan, tidak dapat diubah manual
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Jumlah"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Alasan"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="primary"
                onClick={addRequest}
                fullWidth
              >
                Tambahkan Barang
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Request Table */}
      <Typography variant="h6" sx={{ mt: 3 }}>
        Barang yang Diminta
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nama Barang</TableCell>
            <TableCell>Kategori</TableCell>
            <TableCell>Jumlah</TableCell>
            <TableCell>Stok</TableCell>
            <TableCell>Alasan</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request, index) => (
            <TableRow key={index}>
              <TableCell>{request.item_name}</TableCell>
              <TableCell>{request.category_name}</TableCell>
              <TableCell>{request.quantity}</TableCell>
              <TableCell>{request.stock}</TableCell>
              <TableCell>{request.reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={requests.length === 0}
        sx={{ mt: 2 }}
      >
        Kirim Permintaan
      </Button>
    </div>
  );
};

export default RequestForm;
