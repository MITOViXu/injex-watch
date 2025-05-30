import React, { useState } from "react";
import {
  Box,
  useTheme,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useAddAttackerMutation } from "state/api"; // Mutation to add attacker

const TestAttack = () => {
  const theme = useTheme();

  // States for managing the form and dialog
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(""); // State for username
  const [password, setPassword] = useState(""); // State for password
  const [addAttacker] = useAddAttackerMutation(); // Hook for adding attacker

  // Function to open dialog
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Function to handle form submission
  const handleLogin = (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Nhập cả username và password");
      return;
    }

    // Combine username and password
    const input_val = `${username}${password}`;

    // Send the combined input to the predict_sqli_attack API (Flask backend)
    fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input_val: input_val }), // Send combined input
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.attack_detected) {
          console.log("Phát hiện SQL injection!");

          // Fetch IP address
          fetch("https://api.ipify.org?format=json")
            .then((response) => response.json())
            .then((ipData) => {
              const ip = ipData.ip;
              console.log("User IP:", ip);

              // Fetch location based on IP
              fetch(`http://ip-api.com/json/${ip}`)
                .then((response) => response.json())
                .then((locationData) => {
                  const { lat, lon } = locationData;
                  console.log("Location: Latitude:", lat, "Longitude:", lon);

                  // Create attacker payload
                  const attackerData = {
                    ip: ip,
                    location: {
                      longitude: lon,
                      latitude: lat,
                    },
                    devices: [
                      {
                        ip: "192.168.48.128", // Example device IP
                        port: 3000, // Example device port
                      },
                    ],
                  };

                  // Add attacker to the database
                  addAttacker(attackerData)
                    .then((response) => {
                      console.log("Thêm kẻ tấn công:", response);
                      alert(`Attacker được thêm với địa chỉ IP: ${ip}`);
                      setOpen(false); // Close the dialog after success
                      setUsername("");
                      setPassword("");
                    })
                    .catch((error) => {
                      console.error("Xảy ra lỗi khi thêm Attacker:", error);
                      alert("Xảy ra lỗi khi thêm Attacker");
                    });
                })
                .catch((error) => {
                  console.error("Lỗi xác định vị trí:", error);
                  alert("Lỗi xác định vị trí");
                });
            })
            .catch((error) => {
              console.error("Lỗi xác định IP:", error);
              alert("Lỗi xác định IP");
            });
        } else {
          alert("Không phát hiện SQL injection.");
          setUsername("");
          setPassword("");
          setOpen(false);
        }
      })
      .catch((error) => {
        console.error("Lỗi AI:", error);
        alert("Lỗi AI");
      });
  };

  return (
    <Box m="1.5rem 2.5rem">
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{ mb: 2, mt: 2 }}
      >
        Đăng nhập
      </Button>

      {/* Dialog for Login */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên"
            type="text"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Mật khẩu"
            type="password" // Changed to "password" for security
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Hủy
          </Button>
          <Button onClick={handleLogin} sx={{ color: "#74f7ba" }}>
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestAttack;
