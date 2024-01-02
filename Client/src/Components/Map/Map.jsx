import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import React, { useState, useCallback } from "react";

const MapComponent = React.memo(({ onSelectLocation }) => {
  const [position, setPosition] = useState([0, 0]);

  const handleMapClick = useCallback(
    (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onSelectLocation({ latitude: lat, longitude: lng });
      console.log("Map clicked:", lat, lng);
    },
    [onSelectLocation]
  );

  return (
    <MapContainer
      center={[0, 0]}
      zoom={5}
      style={{ height: "400px", width: "100%" }}
      onClick={handleMapClick}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker
        position={position}
        icon={L.icon({
          iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
          shadowSize: [41, 41],
        })}
      >
        <Popup>Your selected location</Popup>
      </Marker>
    </MapContainer>
  );
});

export default MapComponent;
