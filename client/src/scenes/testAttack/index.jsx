import React, { useState, useEffect } from "react";
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
      alert("Please enter both username and password");
      return;
    }

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
                console.log("Attacker added:", response);
                alert(`Attacker added with IP: ${ip}`);
                setOpen(false); // Close the dialog after success
              })
              .catch((error) => {
                console.error("Error adding attacker:", error);
                alert("Error adding attacker");
              });
          })
          .catch((error) => {
            console.error("Error fetching location:", error);
            alert("Error fetching location");
          });
      })
      .catch((error) => {
        console.error("Error fetching IP:", error);
        alert("Error fetching IP address");
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
