import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Button, TextField, Typography, Box, CircularProgress, Card, CardContent } from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import L from "leaflet";  
import "leaflet/dist/leaflet.css";

const MapView = () => {
  const { id } = useParams();

  const [shipment, setShipment] = useState(null);
  const [newLocation, setNewLocation] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const geocodeLocation = async (locationName) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${locationName}`
      );
      if (response.data && response.data[0]) {
        const lat = parseFloat(response.data[0].lat);
        const lon = parseFloat(response.data[0].lon);
        return !isNaN(lat) && !isNaN(lon) ? [lat, lon] : null;
      }
    } catch (error) {
      console.error("Error geocoding location:", error);
    }
    return null;
  };

  
  const fetchShipmentData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/shipments/${id}`);
      const shipmentData = response.data;
      
      setNewLocation(shipmentData.currentLocation)

      setShipment(shipmentData);
    } catch (error) {
      console.error("Error fetching shipment data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipmentData();
  }, [id]);

  const handleLocationChange = (e) => setNewLocation(e.target.value);

  const updateShipmentLocation = async () => {
    try {
      const geocodedLocation = await geocodeLocation(newLocation);
      if (geocodedLocation) {
        setLoading(true);

       
        const updatedRoute = shipment.route
          ? [...shipment.route, { lat: geocodedLocation[0], lng: geocodedLocation[1] }]
          : [{ lat: geocodedLocation[0], lng: geocodedLocation[1] }];

        const response = await axios.post(
          `http://localhost:5000/api/shipments/${id}/update-location`,
          {
            location: newLocation,
            route: updatedRoute,
          }
        );

        setShipment(response.data);
        setIsEditing(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating shipment location", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !shipment) {
    return (
      <Box sx={{ padding: 4 }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  const zoomLevel = 6;
  const lastRoutePoint = shipment.route && shipment.route.length > 0 ? shipment.route[shipment.route.length - 1] : null;
  const currentLocation = Array.isArray(shipment.currentLocation) && shipment.currentLocation.length === 2
    ? shipment.currentLocation
    : lastRoutePoint;

  
  const markerIcon = new L.Icon({
    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/0/03/Green_dot.svg", 
    iconSize: [30, 30], 
    iconAnchor: [15, 30], 
    popupAnchor: [0, -30], 
  });

  return (
    <Box sx={{ padding: 4 }}>
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Shipment Location & Route
            </Typography>
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="h6">Container ID: {shipment.containerID}</Typography>
              <Typography variant="body1">Status: {shipment.status}</Typography>
              <Typography variant="body1">Current Location: {newLocation}</Typography>
              <Typography variant="body1">ETA: {shipment.eta}</Typography>
            </Box>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <MapContainer
                center={currentLocation || [0, 0]}
                zoom={zoomLevel}
                style={{ width: "100%", height: "500px" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {currentLocation && (
                  <Marker position={currentLocation} icon={markerIcon}>
                    <Popup>
                      <strong>Current Location:</strong> {newLocation || shipment.currentLocation || "Unknown"}
                    </Popup>
                  </Marker>
                )}
                {shipment.route && shipment.route.length > 0 && <Polyline positions={shipment.route} color="#1976d2" weight={4} />}
              </MapContainer>
            </motion.div>

            {isEditing ? (
              <Box sx={{ marginTop: 3 }}>
                <TextField label="New Location (Name)" variant="outlined" fullWidth margin="normal" value={newLocation} onChange={handleLocationChange} />
                <Button variant="contained" color="primary" onClick={updateShipmentLocation} sx={{ marginTop: 2 }}>
                  Update Location
                </Button>
              </Box>
            ) : (
              <Button variant="contained" color="secondary" onClick={() => setIsEditing(true)} sx={{ marginTop: 2 }}>
                Edit Location
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default MapView;
