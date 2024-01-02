import React from "react";
import { useState , useCallback , useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import NavigationTab from "../Dashboard/ProfileCreation/NavigationTab";
import Modal from 'react-modal';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';

Modal.setAppElement('#root');

function ProfileP1() {
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState();
  const [showMapModal, setShowMapModal] = useState(false);
  // --> To Handle Input Fields
  const [profileData, SetProfileData] = useState({
    name: "",
    phone_no: "",
    website: "",
    latitude: 0,
    longitude: 0,
  });

  const [modalIsOpen, setModalIsOpen] = useState(false);
  let lat = 27.7172;
  let lng = 85.3240;
  const [selectedLocation, setSelectedLocation] = useState({ lat, lng });

  const openModal = () => {
    console.log('Opening modal');
    if (!modalIsOpen) {
      setModalIsOpen(true);
    }
  };  

  const closeModal = () => {
    console.log('closing modal');
    setModalIsOpen(false);
  };


  const MapClickHandler = () => {
    const map = useMapEvent('click', (e) => {
      const { lat, lng } = e.latlng;
      console.log("Map clicked:", lat, lng);
      setSelectedLocation({ lat, lng });
      console.log("Selected Location:", selectedLocation);
      SetProfileData((oldValue) => ({ ...oldValue, latitude: lat, longitude: lng }));

    });

    // You can add more event handlers here using the map object if needed
    // Example: map.on('zoomend', () => { /* handle zoom end */ });
  };

  return (
    <div>
      {" "}
      <form className="bg-white modalShadow w-3/5 m-auto mt-10  pb-12 ">
        <NavigationTab
          first_value={"Organization"}
          second_value={""}
          third_value={""}
          fourth_value={""}
          active={1}
          text={1}
        />
        <div className="w-4/5  m-auto mt-12 flex">
          <div className="w-1/2 mr-1">
            <label className="label line1 block " htmlFor="first_name">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Humza"
              autoComplete="on"
              className="input input-bordered h-10 w-4/5 max-w-xs"
              value={profileData.name}
              onChange={(e) =>
                SetProfileData((oldValue) => ({
                  ...oldValue,
                  name: e.target.value,
                }))
              }
            />
          </div>

          <div className="w-1/2 mr-1">
            <label className="label line1 block " htmlFor="first_name">
              Phone No.
            </label>
            <input
              type="tel"
              name="tel_number"
              id="tel_number"
              placeholder="+92 - 1112-222"
              autoComplete="on"
              className="input input-bordered h-10 w-4/5 max-w-xs"
              value={profileData.phone_no}
              onChange={(e) =>
                SetProfileData((oldValue) => ({
                  ...oldValue,
                  phone_no: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <button
              onClick={(e) => {
                e.preventDefault();
                openModal(e);
              }}
            >
              Select Location
            </button>
            {modalIsOpen && (
              <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={{
                  overlay: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  content: {
                    width: "80%",
                    height: "70%",
                    position: "relative",
                  },
                }}
              >
                <button
                  onClick={() => {
                    console.log("modal status", modalIsOpen);
                    closeModal();
                  }}
                >
                  Close
                </button>
                <MapContainer
                  center={[selectedLocation.lat, selectedLocation.lng]}
                  zoom={15}
                  style={{ width: "100%", height: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker
                    position={[selectedLocation.lat, selectedLocation.lng]}
                    icon={L.icon({
                      iconUrl:
                        "https://unpkg.com/leaflet/dist/images/marker-icon.png",
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [1, -34],
                      shadowUrl:
                        "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
                      shadowSize: [41, 41],
                    })}
                  >
                    <Popup>Your selected location</Popup>
                    <MapClickHandler />
                  </Marker>
                </MapContainer>
                <div>
                  Latitude: {selectedLocation.lat}, Longitude:{" "}
                  {selectedLocation.lng}
                </div>
              </Modal>
            )}
          </div>

          <MapContainer
            center={[51.0, -0.09]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[51.0, -0.09]}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="w-4/5 m-auto mt-2 flex">
          <div className="w-1/2 mr-1">
            <label className="label line1 block " htmlFor="first_name">
              Website
            </label>
            <input
              type="url"
              name="website"
              id="website"
              placeholder="Meta.org"
              autoComplete="on"
              className="input input-bordered h-10 w-4/5 max-w-xs"
              value={profileData.website}
              onChange={(e) =>
                SetProfileData((oldValue) => ({
                  ...oldValue,
                  website: e.target.value,
                }))
              }
            />
          </div>

          <div className="w-1/2 mr-1">
            <label className="label line1 block " htmlFor="first_name">
              Logo
            </label>
            <label
              htmlFor="filePicker"
              className="btnfont btn  w-2/5 m-auto bg-primary border-none hover:bg-black"
            >
              Upload
            </label>
            <input
              id="filePicker"
              style={{ visibility: "hidden" }}
              onChange={(event) => {
                setSelectedImage(event.target.files[0]);
              }}
              type="file"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            navigate("/profilesetup/organization", {
              state: { basicInfo: profileData, image: selectedImage },
            })
          }
          className=" mt-12 btnfont btn btn-wide  bg-primary border-none hover:bg-black text-center m-auto block "
        >
          NEXT{" "}
        </button>
      </form>
      {showMapModal && (
        <MapModal
          onSelectLocation={handleLocationSelect}
          onClose={() => {
            setShowMapModal(false);
            console.log("Modal closed");
          }}
        />
      )}
    </div>
  );
}

export default ProfileP1;
