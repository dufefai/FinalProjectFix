import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import SideBar from "../sidebar/SideBar";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import PendingOrders from "./orders/PendingOrders";
import ShippedOrders from "./orders/ShippedOrders";
import DeliveredOrders from "./orders/DeliveredOrders";
import CancelledOrders from "./orders/CancelledOrders";

const Order = () => {
  const [activeTab, setActiveTab] = useState(0);

  const navigate = useNavigate();
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  return (
    <div className="flex min-h-screen">
      <div className="w-[90px] xl:w-[400px]">
        <SideBar />
      </div>
      <div className="md:pl-[87px] w-full pl-[12px]">
        <div className="flex items-center">
        <button
          onClick={() => navigate("/market")}
          className="flex items-center text-gray-500 hover:rounded-full hover:bg-gray-100 p-3"
          aria-label="Back"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
        </button>
        <div className="front-semibold">Orders</div>
        </div>
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
          <CancelledOrders  />
        </TabPanel>
      </div>
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
