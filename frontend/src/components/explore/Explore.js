import React, { useState, useEffect } from "react";
import SideBar from "../sidebar/SideBar";
import SidebarRight from "../sidebarRight/SidebarRight";
import { Tabs, Tab, Box } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import SearchUser from "./SearchUser";
import SearchProduct from "./SearchProduct";
import SearchPost from "./SearchPost";
import { useLocation } from "react-router-dom";

const Explore = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("query") || "";
    setSearchQuery(query);
  }, [location]);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };


  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-[90px] xl:w-[400px]">
        <SideBar />
      </div>
      <div className="w-[57%] md:w-[39%]">
        <div className="relative w-[80%] ml-14 py-4">
          <span
            className={`absolute left-3 top-1/2 pl-2 transform -translate-y-1/2 ${
              isFocused ? "text-blue-500" : "text-gray-500"
            }`}
          >
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full pl-14 p-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-1 focus:ring-blue-300 bg-gray-200 focus:bg-white"
          />
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
            aria-label="store dashboard tabs"
            sx={{ width: "100%" }}
            variant="fullWidth"
          >
            <Tab
              label="User"
              sx={{
                flexGrow: 1,
                textAlign: "center",
                minWidth: 0,
                padding: 0,
              }}
            />
            <Tab
              label="Post"
              sx={{
                flexGrow: 1,
                textAlign: "center",
                minWidth: 0,
                padding: 0,
              }}
            />
            <Tab
              label="Store"
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
          <SearchUser query={searchQuery} />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <SearchPost query={searchQuery} />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <SearchProduct query={searchQuery} />
        </TabPanel>
      </div>
      <div className="w-[25%] border-l border-gray-300">
        <SidebarRight />
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
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

export default Explore;
