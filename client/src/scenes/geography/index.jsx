import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Icon cho marker
const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2776/2776067.png",
  iconSize: [32, 32],
});

const Geography = () => {
  // State để lưu tọa độ và IP
  const [position, setPosition] = useState(null);
  const [ipAddress, setIpAddress] = useState("");
  const [ob, setOb] = useState(null);

  // State cho trạng thái website
  const [websiteStatus, setWebsiteStatus] = useState("Checking...");
  const [responseTime, setResponseTime] = useState("N/A");

  // Lấy tọa độ thực tế từ trình duyệt
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Tọa độ thực tế:", position.coords);
          setPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          window.alert("Lỗi khi lấy tọa độ");
          console.error("Lỗi khi lấy tọa độ:", error);
        }
      );
    } else {
      window.alert("Trình duyệt không hỗ trợ");
      console.error("Trình duyệt không hỗ trợ Geolocation");
    }
  };

  // Lấy địa chỉ IP thực tế
  const getIPAddress = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      setIpAddress(data.ip);
      console.log("Địa chỉ ip kẻ tấn công: ", data);
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ IP:", error);
      setIpAddress("Không thể lấy địa chỉ IP");
    }
  };

  // Lấy IP của kẻ tấn công (dùng ip-api)
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => {
        console.log("IP:", data);
      })
      .catch((error) => console.error("Error fetching IP:", error));
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => {
        console.log("IP:", data);
      })
      .catch((error) => console.error("Error fetching IP:", error));
    fetch("https://api.ipify.org?format=json")
      .then((response) => response.json())
      .then((data) => {
        console.log("IP:", data.ip);
        // Dùng IP để lấy vị trí từ ip-api
        return fetch(`http://ip-api.com/json/${data.ip}`);
      })
      .then((response) => response.json())
      .then((data) => {
        console.log("Thành phố:", data.city);
        console.log("Khu vực:", data.regionName);
        console.log("Quốc gia:", data.country);
        console.log("Vĩ độ:", data.lat);
        console.log("Kinh độ:", data.lon);
      })
      .catch((error) => console.error("Error:", error));
    const getlocation = () => {
      // Get the user location with IP address
      fetch("https://ipapi.co/json/")
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
        });
    };
  }, []);

  // Kiểm tra trạng thái website
  const checkWebsiteStatus = async () => {
    try {
      const start = Date.now(); // Bắt đầu tính thời gian phản hồi
      const response = await fetch("http://192.168.48.128:3000/");
      const end = Date.now(); // Kết thúc tính thời gian phản hồi

      if (response.ok) {
        setWebsiteStatus("✅ UP");
      } else {
        setWebsiteStatus("❌ DOWN");
      }
      setResponseTime(`${end - start} ms`);
    } catch (error) {
      setWebsiteStatus("❌ DOWN");
      setResponseTime("N/A");
      console.error("Error checking website status:", error);
    }
  };

  useEffect(() => {
    // getLocation(); // Lấy tọa độ khi mở trang
    // getIPAddress(); // Lấy IP khi mở trang
    checkWebsiteStatus(); // Kiểm tra trạng thái website ngay lập tức

    const interval = setInterval(checkWebsiteStatus, 5000); // Kiểm tra lại mỗi 5 giây
    return () => clearInterval(interval); // Dọn dẹp interval khi component bị unmount
  }, []);

  return (
    <div style={{ height: "500px", width: "100%" }}>
      {/* Hiển thị thông tin IP */}
      <h1>Địa chỉ IP của bạn: {ipAddress}</h1>
      <h1>IP của kẻ tấn công: {ob || "None"}</h1>

      {/* Hiển thị trạng thái của website */}
      <div>
        <h2 className="font-bold mt-4">Website Status:</h2>
        <p>
          Trạng thái:{" "}
          {websiteStatus === "✅ UP" ? (
            <span className="text-green-500">{websiteStatus}</span>
          ) : (
            <span className="text-red-500">{websiteStatus}</span>
          )}
        </p>
        <p>Thời gian phản hồi: {responseTime}</p>
      </div>

      {/* Hiển thị tọa độ trên bản đồ */}
      {position ? (
        <>
          <h2 className="mt-4 font-bold">Toạ độ hiện tại:</h2>
          <p>
            Latitude: {position.latitude}, Longitude: {position.longitude}
          </p>
          {/* latitude : 10.878976 longitude : 105.1820032 */}
          <MapContainer
            center={[10.822, 106.6257]}
            zoom={15}
            style={{ height: "100%", width: "100%", marginTop: "10px" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[10.822, 106.6257]} icon={customIcon}>
              <Popup>
                Vị trí hiện tại của bạn:
                <br />
                Lat: {position.latitude}, Lon: {position.longitude}
              </Popup>
            </Marker>
          </MapContainer>
        </>
      ) : (
        <h2 className="text-red-500">Không thể lấy vị trí</h2>
      )}

      {/* Nút cập nhật vị trí */}
      <button
        onClick={getLocation}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: "#4CAF50",
          color: "white",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Cập nhật vị trí
      </button>
    </div>
  );
};

export default Geography;
