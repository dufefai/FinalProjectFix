import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import PendingOrders from "./PendingOrders";
import ShippedOrders from "./ShippedOrders";
import DeliveredOrders from "./DeliveredOrders";
import CancelledOrders from "./CancelledOrders";

const Order = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  return (
    <div>
      <Box
        sx={{
          borderBottom: 1,
          borderTop: 1,
          borderColor: "divider",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "white",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="order dashboard tabs"
          sx={{ width: "100%" }}
          variant="fullWidth"
        >
          <Tab
            label="Pending Orders"
            sx={{
              flexGrow: 1,
              textAlign: "center",
              minWidth: 0,
              padding: 0,
            }}
          />
          <Tab
            label="Shipped Orders"
            sx={{
              flexGrow: 1,
              textAlign: "center",
              minWidth: 0,
              padding: 0,
            }}
          />
          <Tab
            label="Delivered Orders"
            sx={{
              flexGrow: 1,
              textAlign: "center",
              minWidth: 0,
              padding: 0,
            }}
          />
          <Tab
            label="Cancelled Orders"
            sx={{
              flexGrow: 1,
              textAlign: "center",
              minWidth: 0,
              padding: 0,
            }}
          />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <PendingOrders />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <ShippedOrders />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <DeliveredOrders />
      </TabPanel>
      <TabPanel value={activeTab} index={3}>
        <CancelledOrders />
      </TabPanel>
    </div>
  );
};

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export default Order;
