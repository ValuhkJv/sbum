import React, { useState } from "react";
import {
  Box,
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  styled,
  CssBaseline,
  ListItemButton,
  Typography,
  Divider,
  Collapse,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Home as HomeIcon,
  Approval as ApprovalIcon,
  FeaturedPlayList as FeaturedPlayListIcon,
  Summarize as SummarizeIcon,
  Handshake as HandshakeIcon,
  RequestQuote as RequestQuoteIcon,
  EventAvailable as EventAvailableIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { Link, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import polibatam from "../assets/logoPolibatam.png";
import DashboardStaf from "../component/AdminDashboard";
import DashboardUnit from "../component/UnitDashboard";
import DashboardUnitHead from "../component/HeadUnitDashboard";
import DashboardMahasiswa from "../component/MhsDashboard";
import Manage from "./Manage";
import Loan from "./Loan";
import LoanApproval from "./LoanApproval";
import LoanHistory from "./LoanHistory";
import Request from "./request/Request";
import RequestApproval from "./request/RequestApproval";
import RequestApprovDetail from "./request/RequestApprovDetail";
import RequestList from "./request/RequestList";
import Laporan from "./Laporan";
import DetailRequest from "./request/RequestDetails";
import RequestApprovalAdmin from "./request/RequestApprovaladmin";
import RequestApprovDetailadmin from "./request/RequestApprovDetailadmin";

const drawerWidth = 280;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = parseInt(localStorage.getItem("role"), 10 || "guest");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openPeminjaman, setOpenPeminjaman] = useState(false);
  const [openPermintaan, setOpenPermintaan] = useState(false);
  const [openManajemenBarang, setOpenManajemenBarang] = useState(false);
  const navigate = useNavigate();

  const isMobile = useMediaQuery("(max-width: 600px)");

  const roleMapping = {
    1: "staf",
    2: "kepalaunit",
    3: "unit",
    4: "mahasiswa",
  };
  const setRole = roleMapping[role];

  if (!role || !user) {
    return <Navigate to="/" />;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleToggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  const handleClickPeminjaman = () => {
    setOpenPeminjaman(!openPeminjaman);
  };

  const handleClickPermintaan = () => {
    setOpenPermintaan(!openPermintaan);
  };

  const handleClickManajemenBarang = () => {
    setOpenManajemenBarang(!openManajemenBarang);
  };

  const menuItemsByRole = {
    1: [{ text: "Laporan", icon: <SummarizeIcon />, link: "/report" }],
    2: [
      {
        text: "Permintaan",
        icon: <RequestQuoteIcon />,
        link: "/RequestList",
      },
      {
        text: "Peminjaman",
        icon: <EventAvailableIcon />,
        link: "/loan",
      },
    ],
    3: [
      {
        text: "Permintaan",
        icon: <RequestQuoteIcon />,
        link: "/RequestList",
      },
      {
        text: "Peminjaman",
        icon: <EventAvailableIcon />,
        link: "/loan",
      },
    ],
    4: [
      {
        text: "Peminjaman",
        icon: <EventAvailableIcon />,
        link: "/loan",
      },
    ],
  };

  const menuItems = menuItemsByRole[role] || [];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        open={!isMobile || openDrawer}
        sx={{ bgcolor: "#3691BE" }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: "80px !important",
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleToggleDrawer}
          >
            <MenuIcon sx={{ fontSize: 30 }} />
          </IconButton>
          <IconButton
            size="large"
            color="inherit"
            aria-label="logout"
            onClick={handleLogout}
          >
            <AccountCircleIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={openDrawer}
        onClose={handleToggleDrawer}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#242D34",
          },
        }}
      >
        <Box sx={{ overflow: "auto", height: "100%", py: 1, px: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "80px",
              padding: "20px 0",
            }}
          >
            <img
              src={polibatam}
              alt="logo polibatam"
              style={{ height: "70px" }}
            />
            <Typography variant="body1" sx={{ color: "white" }}>
              <strong>SBUM</strong> <br /> SUB-BAGIAN UMUM POLIBATAM
            </Typography>
          </Box>
          <Divider
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              height: "1px",
              margin: "8px 0",
            }}
          />

          <List>
            <ListItem disablePadding sx={{ color: "white" }}>
              <ListItemButton component={Link} to={`/dashboard/${setRole}`}>
                <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>

            {setRole === "staf" && (
              <>
                <ListItem disablePadding sx={{ color: "white" }}>
                  <ListItemButton onClick={handleClickPeminjaman}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                        <ApprovalIcon />
                      </ListItemIcon>
                      <ListItemText primary="Persetujuan Peminjaman" />
                    </Box>
                    {openPeminjaman ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>

                <Collapse in={openPeminjaman} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/loan/approval"
                    >
                      <ListItemText primary="Persetujuan" />
                    </ListItemButton>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/loan/transaction/history"
                    >
                      <ListItemText primary="Riwayat Transaksi" />
                    </ListItemButton>
                  </List>
                </Collapse>

                <ListItem disablePadding sx={{ color: "white" }}>
                  <ListItemButton onClick={handleClickPermintaan}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                        <HandshakeIcon />
                      </ListItemIcon>
                      <ListItemText primary="Persetujuan Permintaan" />
                    </Box>
                    {openPermintaan ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>

                <Collapse in={openPermintaan} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to={
                        role === 2
                          ? "/request/approval"
                          : "/request/approvaladmin"
                      }
                    >
                      <ListItemText primary="Persetujuan" />
                    </ListItemButton>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/request/transaction/history"
                    >
                      <ListItemText primary="Riwayat Transaksi" />
                    </ListItemButton>
                  </List>
                </Collapse>

                <ListItem disablePadding sx={{ color: "white" }}>
                  <ListItemButton onClick={handleClickManajemenBarang}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                        <FeaturedPlayListIcon />
                      </ListItemIcon>
                      <ListItemText primary="Manajemen Barang" />
                    </Box>
                    {openManajemenBarang ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>

                <Collapse in={openManajemenBarang} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/manage/barangkonsumsi"
                    >
                      <ListItemText primary="Persediaan Barang Konsumsi" />
                    </ListItemButton>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/manage/barangrt"
                    >
                      <ListItemText primary="Barang Rumah Tangga" />
                    </ListItemButton>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/manage/barangpeminjaman"
                    >
                      <ListItemText primary="Peminjaman" />
                    </ListItemButton>
                  </List>
                </Collapse>
              </>
            )}

            {(setRole === "kepalaunit" || role === "staf") && (
              <>
                <ListItem disablePadding sx={{ color: "white" }}>
                  <ListItemButton onClick={handleClickPermintaan}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                        <HandshakeIcon />
                      </ListItemIcon>
                      <ListItemText primary="Persetujuan Permintaan" />
                    </Box>
                    {openPermintaan ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>

                <Collapse in={openPermintaan} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/request/approval"
                    >
                      <ListItemText primary="Persetujuan" />
                    </ListItemButton>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/request/transaction/history"
                    >
                      <ListItemText primary="Riwayat Transaksi" />
                    </ListItemButton>
                  </List>
                </Collapse>
              </>
            )}

            {menuItems.map((item, index) => (
              <ListItem key={index} disablePadding sx={{ color: "white" }}>
                <ListItemButton component={Link} to={item.link}>
                  <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Routes>
          <Route path="/dashboard/staf" element={<DashboardStaf />} />
          <Route path="/dashboard/kepalaUnit" element={<DashboardUnitHead />} />
          <Route path="/dashboard/unit" element={<DashboardUnit />} />
          <Route path="/dashboard/mahasiswa" element={<DashboardMahasiswa />} />
          <Route path="/manage/barangkonsumsi" element={<Manage />} />
          <Route path="/manage/barangrt" element={<Manage />} />
          <Route path="/manage/barangpeminjaman" element={<Manage />} />
          <Route path="/report" element={<Laporan />} />
          <Route path="/loan" element={<Loan />} />
          <Route path="/loan/approval" element={<LoanApproval />} />
          <Route path="/loan/transaction/history" element={<LoanHistory />} />
          <Route path="/request" element={<Request />} />
          <Route path="/RequestList" element={<RequestList />} />
          <Route path="/DetailPermintaan/:date" element={<DetailRequest />} />
          <Route path="/request/approval" element={<RequestApproval />} />
          <Route
            path="/requests/:request_id"
            element={<RequestApprovDetail />}
          />
          <Route
            path="/request/approvaladmin"
            element={<RequestApprovalAdmin />}
          />
          <Route
            path="/requests/:request_id"
            element={<RequestApprovDetailadmin />}
          />
        </Routes>
      </Box>
    </Box>
  );
}
