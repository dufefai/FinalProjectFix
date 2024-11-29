import { React, useState } from "react";
import ReactMapGL, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { debounce } from "lodash";
import axios from "axios";

const StoreLocation = ({ onSelectLocation }) => {
  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    longitude: 105.8482,
    latitude: 21.0335,
    zoom: 19,
  });

  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

  const Suggestions = debounce(async (query) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${accessToken}&autocomplete=true&country=VN&limit=5`;
    
    try {
      const response = await axios.get(url);
      setSuggestions(response.data.features);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, 300);

  const getAddressFromLatLon = async (latitude, longitude) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}`;

    try {
      const response = await axios.get(url);
      const address = response.data.features[0]?.place_name || "Unknown location";
      return address;
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const handleSelectSuggestion = (place) => {
    const { center } = place;
    setViewport({
      ...viewport,
      latitude: center[1],
      longitude: center[0],
    });
    setSuggestions([]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { latitude, longitude } = viewport;
    const address = await getAddressFromLatLon(latitude, longitude);
    const newAddress = {
      address,
      lat: latitude,
      long: longitude,
    };
    
    onSelectLocation(newAddress); // Truyền đối tượng newAddress về component cha (CreateStore)
  };

  return (
    <>
      <ReactMapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={accessToken}
        onMove={(evt) => setViewport(evt.viewState)}
      >
            <Marker
          latitude={viewport.latitude}
          longitude={viewport.longitude}
          offsetLeft={-20}
          offsetTop={-10}
        >
          <FontAwesomeIcon
            icon={faLocationDot}
            className="text-red-500 text-4xl"
          />
        </Marker>
      </ReactMapGL>

      <div className="absolute top-12 left-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            Suggestions(e.target.value);
          }}
          placeholder="Search for your location or nearby places"
          className="p-2 w-80 rounded border border-gray-300"
        />

        {suggestions.length > 0 && (
          <ul className="list-none p-0 m-0 bg-white border border-gray-300 rounded w-72 max-h-36 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="p-2 cursor-pointer hover:bg-gray-100"
              >
                {suggestion.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleSave}
        className="absolute top-2 left-3.5 px-3 py-2 bg-green-600 text-white border-none rounded cursor-pointer"
      >
        Save
      </button>
    </>
  );
};

export default StoreLocation;
