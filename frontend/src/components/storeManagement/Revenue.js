import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axiosJWT from "../../config/axiosJWT";
import {
  faShoppingBag,
  faUser,
  faUndo,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const Revenue = () => {
  const user = useSelector((state) => state.auth.login?.currentUser);

  const [todayStats, setTodayStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [deliveredStats, setDeliveredStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    revenueIncreaseLast7Days: 0,
    revenueGrowth: "0%",
  });

  const [cancelledStats, setCancelledStats] = useState({
    totalCancelledOrders: 0,
    cancelledOrdersLast7Days: 0,
    cancellationRate: "0.00%",
    cancellationRateLast7Days: "0.00%",
  });

  const [customerStats, setCustomerStats] = useState({
    totalUniqueCustomers: 0,
    newCustomersThisWeek: 0,
    rateOfNewCustomers: "0%",
    avgTimeToCompleteOrder: "0.00",
  });


  const [revenueData, setRevenueData] = useState([]);
  const [timeFrame, setTimeFrame] = useState("last7Days");

  const [topProducts, setTopProducts] = useState([]);

  const getTodayOrdersAndRevenue = async (accessToken) => {
    try {
      const res = await axiosJWT.get(
        `${process.env.REACT_APP_BACKEND_API}/api/store/getTodayOrdersAndRevenue`,
        {
          headers: { token: `Bearer ${accessToken}` },
        }
      );
      setTodayStats({
        totalOrders: res.data.totalOrders,
        totalRevenue: res.data.totalRevenue,
      });
    } catch (error) {
      console.error("Error fetching today's orders and revenue:", error);
    }
  };

  const getDeliveredOrderStatistics = async (accessToken) => {
    try {
      const res = await axiosJWT.get(
        `${process.env.REACT_APP_BACKEND_API}/api/store/getDeliveredOrderStatistics`,
        {
          headers: { token: `Bearer ${accessToken}` },
        }
      );
      setDeliveredStats({
        totalOrders: res.data.totalOrders,
        totalRevenue: res.data.totalRevenue,
        revenueIncreaseLast7Days: res.data.revenueIncreaseLast7Days,
        revenueGrowth: res.data.revenueGrowth,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const getCancelledOrderStatistics = async (accessToken) => {
    try {
      const res = await axiosJWT.get(
        `${process.env.REACT_APP_BACKEND_API}/api/store/getCancelledOrderStatistics`,
        {
          headers: { token: `Bearer ${accessToken}` },
        }
      );
      setCancelledStats({
        totalCancelledOrders: res.data.totalCancelledOrders,
        cancelledOrdersLast7Days: res.data.cancelledOrdersLast7Days,
        cancellationRate: res.data.cancellationRate,
        cancellationRateLast7Days: res.data.cancellationRateLast7Days,
      });
    } catch (error) {
      console.error("Error fetching cancelled order statistics:", error);
    }
  };

  const getCustomerStatistics = async (accessToken) => {
    try {
      const res = await axiosJWT.get(
        `${process.env.REACT_APP_BACKEND_API}/api/store/getCustomerStatistics`,
        {
          headers: { token: `Bearer ${accessToken}` },
        }
      );
      setCustomerStats({
        totalUniqueCustomers: res.data.totalUniqueCustomers,
        newCustomersThisWeek: res.data.newCustomersThisWeek,
        rateOfNewCustomers: res.data.rateOfNewCustomers,
        avgTimeToCompleteOrder: res.data.avgTimeToCompleteOrder,
      });
    } catch (error) {
      console.error("Error fetching customer statistics:", error);
    }
  };

  const getBestSellingProducts = async (accessToken) => {
    try {
      const res = await axiosJWT.get(
        `${process.env.REACT_APP_BACKEND_API}/api/store/getBestSellingProducts`,
        {
          headers: { token: `Bearer ${accessToken}` },
        }
      );
      setTopProducts(res.data);
    } catch (error) {
      console.error("Error fetching best-selling products:", error);
    }
  };

  const getTotalRevenueLast7Days = async (accessToken) => {
    try {
      const res = await axiosJWT.get(
        `${process.env.REACT_APP_BACKEND_API}/api/store/getTotalRevenueLast7Days`,
        {
          headers: { token: `Bearer ${accessToken}` },
        }
      );
      setRevenueData(res.data);
    } catch (error) {
      console.error("Error fetching last 7 days revenue:", error);
    }
  };

  const getTotalRevenueLast30Days = async (accessToken) => {
    try {
      const res = await axiosJWT.get(
        `${process.env.REACT_APP_BACKEND_API}/api/store/getTotalRevenueLast30Days`,
        {
          headers: { token: `Bearer ${accessToken}` },
        }
      );
      setRevenueData(res.data);
    } catch (error) {
      console.error("Error fetching last 30 days revenue:", error);
    }
  };

  const getTotalRevenueByMonth = async (accessToken) => {
    try {
      const res = await axiosJWT.get(
        `${process.env.REACT_APP_BACKEND_API}/api/store/getTotalRevenueByMonth`,
        {
          headers: { token: `Bearer ${accessToken}` },
        }
      );
      setRevenueData(res.data);
    } catch (error) {
      console.error("Error fetching monthly revenue:", error);
    }
  };

  useEffect(() => {
    const fetchStatistics = async () => {
      if (user?.accessToken) {
        try {
          await Promise.all([
            getTodayOrdersAndRevenue(user.accessToken),
            getDeliveredOrderStatistics(user.accessToken),
            getCancelledOrderStatistics(user.accessToken),
            getCustomerStatistics(user.accessToken),
            getBestSellingProducts(user.accessToken),
          ]);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchStatistics();
  }, [user]);

  useEffect(() => {
    if (user?.accessToken) {
      if (timeFrame === "last7Days") {
        getTotalRevenueLast7Days(user.accessToken);
      } else if (timeFrame === "last30Days") {
        getTotalRevenueLast30Days(user.accessToken);
      } else if (timeFrame === "byMonth") {
        getTotalRevenueByMonth(user.accessToken);
      }
    }
  }, [timeFrame, user]);

  const handleTimeFrameChange = (event) => {
    setTimeFrame(event.target.value);
  };

  const maxProductsToShow = 5;
  const topProductsLimited = topProducts.slice(0, maxProductsToShow);
  const otherProducts = topProducts.slice(maxProductsToShow);
  const othersSold = otherProducts.reduce(
    (total, product) => total + product.sold,
    0
  );

  const chartData = {
    labels: [
      ...topProductsLimited.map((product) => product.name),
      ...(othersSold > -1 ? ["Others"] : []),
    ],
    datasets: [
      {
        data: [
          ...topProductsLimited.map((product) => product.sold),
          ...(othersSold > -1 ? [othersSold] : []),
        ],
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#B0BEC5",
          ...(othersSold > -1 ? ["#B0BEC5"] : []),
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#B0BEC5",
          ...(othersSold > -1 ? ["#B0BEC5"] : []),
        ],
      },
    ],
  };

  const lineChartData = {
    labels: revenueData.map((data) => data.date || data.month),
    datasets: [
      {
        label: "Revenue",
        data: revenueData.map((data) => data.totalRevenue),
        fill: false,
        borderColor: "#36A2EB",
      },
    ],
  };

  return (
    <div className="bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold">
            Welcome back, {user?.fullName}
          </h1>
          <p className="text-gray-500">
            Here are today's stats from your online store!
          </p>
        </div>
        <div className="bg-white px-4 py-[13px] rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Orders's Today</h2>
          <div className="mb-2">
            <span className="text-gray-600">Total Orders: </span>
            <span className="font-semibold">{todayStats.totalOrders}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Revenue's Today</h2>
            <div>
              <span className="text-gray-600">Total Revenue: </span>
              <span className="font-semibold">
                {todayStats.totalRevenue.toLocaleString()}đ
              </span>
            </div>
          </div>
      </div>
      <main>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-black text-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faShoppingBag} className="text-2xl" />
                <span>Total Sales</span>
              </div>
            </div>
            <div className="text-3xl font-semibold mb-2">
              {deliveredStats.totalRevenue.toLocaleString()}đ
            </div>
            <div className="text-gray-400 mb-4">
              {deliveredStats.totalOrders} Orders
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-1">
                <FontAwesomeIcon icon={faArrowUp} className="text-green-500" />
                <span className="text-green-500">
                  {deliveredStats.revenueGrowth}
                </span>
              </div>
              <div className="text-gray-400">
                +{deliveredStats.revenueIncreaseLast7Days.toLocaleString()}đ
                this week
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-2xl text-gray-500"
                />
                <span>Customers</span>
              </div>
            </div>
            <div className="text-3xl font-semibold mb-2">
              {customerStats.totalUniqueCustomers}
            </div>
            <div className="text-gray-400 mb-4">
              Avg. Order Time: {customerStats.avgTimeToCompleteOrder} hours
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-1">
                <FontAwesomeIcon icon={faArrowUp} className="text-green-500" />
                <span className="text-green-500">
                  +{customerStats.rateOfNewCustomers}
                </span>
              </div>
              <div className="text-gray-400">
                +{customerStats.newCustomersThisWeek} this week
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon
                  icon={faUndo}
                  className="text-2xl text-gray-500"
                />
                <span>Cancelled</span>
              </div>
            </div>
            <div className="text-3xl font-semibold mb-2">
              {cancelledStats.totalCancelledOrders}
            </div>
            <div className="text-gray-400 mb-4">
              {cancelledStats.cancelledOrdersLast7Days} Disputed
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-1">
                <FontAwesomeIcon icon={faArrowUp} className="text-red-500" />
                <span className="text-red-500">
                  +{cancelledStats.cancellationRate}
                </span>
              </div>
              <div className="text-gray-400">
                +{cancelledStats.cancelledOrdersLast7Days}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Sales Performance</span>
              <div className="flex space-x-2">
                <select
                  className="border border-black text-gray-600 px-2 py-1 rounded-full"
                  value={timeFrame}
                  onChange={handleTimeFrameChange}
                >
                  <option value="last7Days">Last 7 Days</option>
                  <option value="last30Days">Last 30 Days</option>
                  <option value="byMonth">By Month</option>
                </select>
              </div>
            </div>
            <Line data={lineChartData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">
                Best Selling Products
              </span>
            </div>
            <div className="flex justify-center mb-4">
              <Doughnut data={chartData} />
            </div>
            {/* Custom legend displaying product names and sold quantities */}
            <div className="text-center mt-4">
              {topProductsLimited.map((product, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center mb-2"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3"
                      style={{
                        backgroundColor:
                          chartData.datasets[0].backgroundColor[index],
                      }}
                    ></div>
                    <span className="truncate max-w-[220px]">
                      {product.name}
                    </span>
                  </div>
                  <span>{product.sold}</span>
                </div>
              ))}
              {othersSold > -1 && (
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-400"></div>
                    <span>Others</span>
                  </div>
                  <span>{othersSold}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Revenue;
