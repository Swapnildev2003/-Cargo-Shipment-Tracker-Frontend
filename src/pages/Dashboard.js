import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addShipment, fetchShipments } from "../redux/shipmentSlice";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  TableSortLabel,
  IconButton,
  Box,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import SortIcon from "@mui/icons-material/Sort";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shipments = useSelector((state) => state.shipments.shipments || []);
  const [containerID, setContainerID] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [eta, setEta] = useState("");
  const [status, setStatus] = useState("Pending");
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortColumn, setSortColumn] = useState("containerID");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchShipments());
  }, [dispatch]);

  const handleAddShipment = async () => {
    if (!containerID || !currentLocation || !eta) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(currentLocation)}`
      );
      const data = await response.json();

      if (data.length === 0) {
        alert("Location not found!");
        return;
      }

      const { lat, lon } = data[0];
      const newShipment = {
        _id: Date.now().toString(),
        containerID,
        currentLocation,
        eta,
        status,
        route: [{ lat: `${lat}`, lng: `${lon}` }],
      };

      dispatch(addShipment(newShipment));
      setContainerID("");
      setCurrentLocation("");
      setEta("");
      setStatus("Pending");
      setShowForm(false);
      dispatch(fetchShipments());
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  const handleSort = (column) => {
    const isAsc = sortColumn === column && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortColumn(column);
  };

  const handleFilterStatus = (event) => {
    setFilterStatus(event.target.value);
  };

  const handleRowClick = (id) => {
    navigate(`/shipment/${id}/map`);
  };

  const sortedShipments = [...shipments].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const filteredShipments = filterStatus
    ? sortedShipments.filter((shipment) => shipment.status === filterStatus)
    : sortedShipments;

  return (
    <Card sx={{ maxWidth: 900, margin: "auto", mt: 5, p: 3 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom align="center" color="primary">
          Shipment Dashboard
        </Typography>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowForm(!showForm)}
            sx={{ display: "flex", alignItems: "center" }}
            startIcon={showForm ? <CancelIcon /> : <AddIcon />}
          >
            {showForm ? "Cancel" : "Add Shipment"}
          </Button>

          <FormControl fullWidth sx={{ width: 200 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select value={filterStatus} onChange={handleFilterStatus} label="Status Filter">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Transit">In Transit</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {showForm && (
          <form noValidate autoComplete="off">
            <TextField
              fullWidth
              label="Container ID"
              variant="outlined"
              value={containerID}
              onChange={(e) => setContainerID(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Current Location"
              variant="outlined"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="date"
              label="ETA"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Transit">In Transit</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" fullWidth onClick={handleAddShipment}>
              Add Shipment
            </Button>
          </form>
        )}

        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === "containerID"}
                    direction={sortDirection}
                    onClick={() => handleSort("containerID")}
                    IconComponent={SortIcon}
                  >
                    Container ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === "currentLocation"}
                    direction={sortDirection}
                    onClick={() => handleSort("currentLocation")}
                    IconComponent={SortIcon}
                  >
                    Location
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === "eta"}
                    direction={sortDirection}
                    onClick={() => handleSort("eta")}
                    IconComponent={SortIcon}
                  >
                    ETA
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === "status"}
                    direction={sortDirection}
                    onClick={() => handleSort("status")}
                    IconComponent={SortIcon}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredShipments.map((shipment) => (
                <TableRow key={shipment._id} hover onClick={() => handleRowClick(shipment.containerID)}>
                  <TableCell>{shipment.containerID}</TableCell>
                  <TableCell>{shipment.currentLocation}</TableCell>
                  <TableCell>{shipment.eta}</TableCell>
                  <TableCell>
                    <Chip
                      label={shipment.status}
                      color={
                        shipment.status === "Delivered"
                          ? "success"
                          : shipment.status === "In Transit"
                          ? "info"
                          : "default"
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
