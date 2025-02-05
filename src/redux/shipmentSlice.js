import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Define API endpoint (replace with your backend URL)
const API_URL = "http://localhost:5000/api/shipments/";

// Async action to fetch shipments from backend
export const fetchShipments = createAsyncThunk("shipments/fetch", async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

// Async action to fetch a single shipment by its ID
export const fetchShipmentById = createAsyncThunk(
  "shipments/fetchById",
  async (id) => {
    const response = await axios.get(`${API_URL}${id}`);
    return response.data;
  }
);

// Async action to update the shipment's location
export const updateShipmentLocation = createAsyncThunk(
  "shipments/updateLocation",
  async ({ id, newLocation, route }) => {
    const response = await axios.post(`${API_URL}${id}/update-location`, {
      location: newLocation,
      route: route,
    });
    return response.data;
  }
);

// Async action to add a new shipment
export const addShipment = createAsyncThunk(
  "shipments/add",
  async (shipment, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, shipment);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Create shipment slice
const shipmentSlice = createSlice({
  name: "shipments",
  initialState: {
    shipments: [],
    shipment: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetching all shipments
      .addCase(fetchShipments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.loading = false;
        state.shipments = action.payload;
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle fetching a single shipment by ID
      .addCase(fetchShipmentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchShipmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.shipment = action.payload;
      })
      .addCase(fetchShipmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle updating shipment location
      .addCase(updateShipmentLocation.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateShipmentLocation.fulfilled, (state, action) => {
        state.loading = false;
        // Update the specific shipment in the state
        const updatedShipmentIndex = state.shipments.findIndex(
          (shipment) => shipment._id === action.payload._id
        );
        if (updatedShipmentIndex !== -1) {
          state.shipments[updatedShipmentIndex] = action.payload;
        }
        state.shipment = action.payload;
      })
      .addCase(updateShipmentLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle adding a new shipment
      .addCase(addShipment.pending, (state) => {
        state.loading = true;
      })
      .addCase(addShipment.fulfilled, (state, action) => {
        state.loading = false;
        state.shipments.push(action.payload);
      })
      .addCase(addShipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default shipmentSlice.reducer;
