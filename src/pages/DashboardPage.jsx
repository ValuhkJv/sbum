import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { useHistory } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// import authService from '../services/authService';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const history = useHistory();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const role = localStorage.getItem("role");
        setUserRole(role);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  const navigateToPage = (path) => {
    history.push(path);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="h6" gutterBottom>
          Welcome, {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 4,
          }}
        >
          {userRole === "admin" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigateToPage("/admin")}
            >
              Go to Admin Dashboard
            </Button>
          )}
          {userRole === "unit" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigateToPage("/unit")}
            >
              Go to Unit Dashboard
            </Button>
          )}
          {userRole === "kepala_unit" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigateToPage("/kepala-unit")}
            >
              Go to Kepala Unit Dashboard
            </Button>
          )}
          {userRole === "mahasiswa" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigateToPage("/mahasiswa")}
            >
              Go to Mahasiswa Dashboard
            </Button>
          )}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default DashboardPage;
