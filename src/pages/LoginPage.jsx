import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Typography,
  Box,
  Container,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import polibatam from "../assets/polibatam.png";
import backgroundImage from "../assets/tekno.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("");

  const handleRoleChange = (e) => {
    setUserRole(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
        role: userRole,
      });

      console.log("Response from server:", response.data); // Debugging
      const { user } = response.data;

      // Simpan data pengguna (opsional, misalnya di localStorage)
      localStorage.setItem("user", JSON.stringify(user));

      // Arahkan ke dashboard sesuai role
      switch (user.role) {
        case "staf":
          navigate("/dashboard/staf");
          break;
        case "kepalaUnit":
          navigate("/dashboard/kepalaUnit");
          break;
        case "unit":
          navigate("/dashboard/unit");
          break;
        case "mahasiswa":
          navigate("/dashboard/mahasiswa");
          break;
        default:
          setError("Role tidak dikenali");
      }
    } catch (err) {
      console.error("Login error:", err); // Debugging
      setError("Invalid username or password");
    }
  };

  return (
    <Container
      component="main"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        minHeight: "100vh",
        minWidth: "100vw",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          maxWidth: "400px",
          width: "100%",
          bgcolor: "white",
          zIndex: 1,
          position: "absolute",
          borderRadius: "10px",
        }}
      >
        <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
          <img
            src={polibatam}
            alt="polibatam"
            style={{ width: "320px", height: "103px" }}
          />
        </Box>
        <Typography
          display="flex"
          justifyContent="center"
          component="h1"
          variant="h5"
          color="grey"
          sx={{ fontWeight: "bold", fontFamily: "Sansita" }}
        >
          Sub Bagian Umum Polibatam
        </Typography>
        <Box component="form" sx={{ mt: 1 }} onSubmit={handleLogin}>
          {/*dropdown jenis user */}
          <Box display="flex" justifyContent="center">
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="jenis-user-label">Jenis User</InputLabel>
              <Select
                labelId="jenis-user-label"
                id="jenis-user"
                value={userRole}
                onChange={handleRoleChange}
                label="Jenis User"
                fullWidth
                sx={{
                  borderRadius: "10px", //menambhakan border
                  "& .MuiSelect-select": {
                    padding: "16px", // atur padding dalam
                    fontSize: "0.875rem", // atur warna teks dropdown
                    fontFamily: "Sansita", // atur style tulisan
                  },
                }}
              >
                <MenuItem value="staf">Staf</MenuItem>
                <MenuItem value="kepalaunit">Kepala Unit</MenuItem>
                <MenuItem value="unit">Unit</MenuItem>
                <MenuItem value="mahasiswa">Mahasiswa</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/*field username & passwowrd */}
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              sx: {
                borderRadius: "10px", // menambahka1n border raadius
                fontFamily: "Sansita",
              },
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              sx: {
                borderRadius: "10px", // menambahkan border raadius
              },
            }}
          />
          {error && <p style={{ color: "red" }}>{error}</p>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              fontFamily: "Sansita",
              backgroundColor: "#3691BE",
              "&:hover": { backgroundColor: "#2c7ba8" },
            }}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
export default Login;
