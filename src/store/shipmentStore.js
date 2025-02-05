import { configureStore } from "@reduxjs/toolkit";
import shipmentReducer from "../redux/shipmentSlice";

const store = configureStore({
  reducer: {
    shipments: shipmentReducer,
  },
});

export default store;
