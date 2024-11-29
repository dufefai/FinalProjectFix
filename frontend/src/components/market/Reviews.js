import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCommnetsStore } from "../../redux/apiRequest";
import axiosJWT from "../../config/axiosJWT";
import SideBar from "../sidebar/SideBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faStar as fullStar,
  faStarHalfAlt as halfStar,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as emptyStar } from "@fortawesome/free-regular-svg-icons";
import { CircularProgress } from "@mui/material";

const Reviews = () => {
  const [loading, setLoading] = useState(true);
  const [filteredComments, setFilteredComments] = useState([]);
  const [selectedStar, setSelectedStar] = useState(null);

  const user = useSelector((state) => state.auth.login?.currentUser);
  const comments = useSelector((state) => state.market?.comments.allComments);
  const id = useParams().id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  const fetchComments = async () => {
    try {
      await getCommnetsStore(user?.accessToken, dispatch, id, axiosJWT);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchComments();
    }
    // eslint-disable-next-line
  }, [user, dispatch, id]);

  useEffect(() => {
    if (comments) {
      if (selectedStar === null) {
        setFilteredComments(comments);
      } else {
        setFilteredComments(
          comments.filter(
            (comment) =>
              Math.floor(comment.rate.$numberDecimal) === selectedStar
          )
        );
      }
    }
  }, [comments, selectedStar]);

  const handleStarFilter = (star) => {
    setSelectedStar(star);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <div className="w-[90px] xl:w-[400px]">
        <SideBar />
      </div>
      <div className="p-4 md:pl-[87px] w-full">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:rounded-full hover:bg-gray-100 p-3"
            aria-label="Back"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
          </button>
          <div className="font-semibold text-lg ml-2">Reviews</div>
        </div>

        {/* Filter Star Ratings */}
        <div className="mb-4 ml-6">
          <div className="flex space-x-4">
            <button
              className={`p-2 rounded-md ${
                selectedStar === null ? "bg-gray-300" : ""
              }`}
              onClick={() => handleStarFilter(null)}
            >
              All comments ({comments.length})
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                className={`p-2 rounded-md ${
                  selectedStar === star ? "bg-gray-300" : ""
                }`}
                onClick={() => handleStarFilter(star)}
              >
                {renderStars(star)} (
                {
                  comments.filter(
                    (comment) =>
                      Math.floor(comment.rate.$numberDecimal) === star
                  ).length
                }
                )
              </button>
            ))}
          </div>
        </div>

        <div className="border border-gray-300 my-4 p-[2px] mx-4 bg-gray-300"></div>

        {/* Loading and Error States */}
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <CircularProgress />
          </div>
        ) : !filteredComments.length ? (
          <div className="flex justify-center items-center h-full">
            No reviews found.
          </div>
        ) : (
          /* Reviews */
          <div className="max-w-7xl mx-auto px-6 pb-6">
            {filteredComments.map((comment, index) => (
              <div key={index} className="mb-6 border-b pb-4">
                <div className="flex items-center mb-2">
                  <img
                    src={
                      comment.user.avatar ||
                      `https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg`
                    }
                    alt={comment.user.fullName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <div className="font-bold">{comment.user.fullName}</div>
                    <div className="flex">
                      {renderStars(comment.rate.$numberDecimal)}
                    </div>
                  </div>
                </div>

                {/* Render item names */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {comment.order.slice(0, 8).map((item, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-gray-700 bg-gray-200 rounded-md px-2 py-1 whitespace-nowrap inline-block"
                    >
                      {item.name}
                    </div>
                  ))}
                </div>

                <p className="mb-2 text-gray-700">{comment.comment || ""}</p>

                <div className="flex flex-wrap mb-2">
                  {comment.rateImage.slice(0, 8).map((image, idx) => (
                    <div key={idx} className="mr-2 mb-2">
                      <img
                        src={image}
                        alt={`Review ${idx + 1}`}
                        className="w-24 h-24 object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>

                <div className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
