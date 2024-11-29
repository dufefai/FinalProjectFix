import React, { useEffect, useState } from "react";
import SideBar from "../sidebar/SideBar";
import { useSelector } from "react-redux";
import { IconButton, CircularProgress, Tabs, Tab, Box } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import CreateStore from "./CreateStore";
import { useDispatch } from "react-redux";
import axiosJWT from "../../config/axiosJWT";
import { getStore } from "../../redux/apiRequest";
import Revenue from "./Revenue";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faLocationDot,
  faStar as fullStar,
  faStarHalfAlt as halfStar,
} from "@fortawesome/free-solid-svg-icons";
import {
  faStar as emptyStar,
  faClock as faThinClock,
} from "@fortawesome/free-regular-svg-icons";
import CategoryList from "./category/CategoryList";
import Order from "./orders/Order";

const StoreDashboard = () => {
  const store = useSelector((state) => state.store?.store.currentStore);
  const user = useSelector((state) => state.auth.login?.currentUser);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStore = async () => {
      if (user) {
        setLoading(true);
        await getStore(user?.accessToken, dispatch, axiosJWT);
        setLoading(false);
      }
    };
    fetchStore();
  }, [user, dispatch]);

  const handleCreateStore = () => {
    setShowCreate(true);
  };

  const closeCreateStore = () => {
    setShowCreate(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderStars = (rate) => {
    const stars = [];
    const fullStars = Math.floor(rate);
    const halfStars = rate % 1 >= 0.5 ? 1 : 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesomeIcon
          icon={fullStar}
          className="text-yellow-500"
          key={`full-${i}`}
        />
      );
    }

    if (halfStars) {
      stars.push(
        <FontAwesomeIcon
          icon={halfStar}
          className="text-yellow-500"
          key="half"
        />
      );
    }

    for (let i = fullStars + halfStars; i < 5; i++) {
      stars.push(
        <FontAwesomeIcon
          icon={emptyStar}
          className="text-yellow-500"
          key={`empty-${i}`}
        />
      );
    }

    return stars;
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-[93px] xl:w-[400px]">
        <SideBar />
      </div>
      {loading ? (
        <div className="w-full flex items-center justify-center">
          <CircularProgress />
        </div>
      ) : !store ? (
        <div className="w-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-bold mb-4">
              You don't have a store yet
            </h2>
            <p className="mb-4">Do you want to create a store?</p>
            <button
              onClick={handleCreateStore}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
            >
              Create New
            </button>
          </div>

          {showCreate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-4 rounded-lg relative">
                <label style={{ position: "absolute", left: 30, top: 14 }}>
                  Create Store
                </label>
                <IconButton
                  aria-label="close"
                  onClick={closeCreateStore}
                  style={{ position: "absolute", right: 8, top: 8 }}
                  title="Close"
                >
                  <CloseIcon />
                </IconButton>
                <div className="w-[400px] h-[380px] overflow-y-auto mt-8">
                  <CreateStore />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : !store.verified ? (
        <div className="w-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-bold mb-4">
              Your store is being reviewed
            </h2>
            <p className="mb-4">
              Once the review is complete, you will be able to manage your store
              here.
            </p>
            <button
              onClick={() => navigate("/market")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
            >
              Discover another marketplace
            </button>
          </div>
        </div>
      ) : (
        <div className="sm:w-full w-[400px] xl:pl-[87px] ">
          <div
            style={{
              backgroundImage: `url(${store.image})`,
              backgroundSize: "cover",
              height: "200px",
            }}
            className=""
          ></div>
          <div className="font-semibold my-2 pl-3">
            <FontAwesomeIcon
              icon={faStore}
              className="text-xl text-blue-500 pr-3"
            />
            <span>{store.name}</span>
            <FontAwesomeIcon
              icon={faThinClock}
              className="text-xl text-gray-500 pl-20"
            />
            <span className="font-nomal pl-3">
              {store.openingTime} - {store.closingTime}
            </span>
            <h1 className="pl-9 font-normal my-2">{store.description}</h1>
            <FontAwesomeIcon
              icon={faLocationDot}
              className="text-xl text-red-500 pr-5"
            />
            <span>{store.address.address}</span>
          </div>

          <div className="flex items-center my-3 pl-3">
            {renderStars(store.rate.$numberDecimal)}
            {parseFloat(store.rate.$numberDecimal) === 0 ? (
              <span className="ml-2">No reviews yet</span>
            ) : (
              <>
                <span className="ml-2">{parseFloat(store.rate.$numberDecimal).toFixed(1)}</span>
              </>
            )}
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
                label="Product Management"
                sx={{
                  flexGrow: 1,
                  textAlign: "center",
                  minWidth: 0,
                  padding: 0,
                }}
              />
              <Tab
                label="Order Management"
                sx={{
                  flexGrow: 1,
                  textAlign: "center",
                  minWidth: 0,
                  padding: 0,
                }}
              />
              <Tab
                label="Revenue Management"
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
            <CategoryList />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <Order />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <Revenue />
          </TabPanel>
        </div>
      )}
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
      {value === index && <Box className="bg-gray-100">{children}</Box>}
    </div>
  );
};

export default StoreDashboard;
