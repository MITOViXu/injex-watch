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
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  useGetDeviceQuery,
  useAddDeviceMutation,
  useDeleteDeviceMutation,
  useUpdateDeviceMutation,
} from "state/api";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import Header from "components/Header";
import { DataGrid } from "@mui/x-data-grid";
import "./style.css";

// Hàm kiểm tra trạng thái website dựa trên IP
const checkWebsiteStatus = async (ip, port) => {
  try {
    const url = `http://${ip}:${port}`;
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    return false;
  }
};

const StatusCell = ({ ip, port, isUnderAttack }) => {
  const [status, setStatus] = useState("inactive");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      const isActive = await checkWebsiteStatus(ip, port);
      setStatus(isActive ? "active" : "inactive");
      setLoading(false);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [ip, port]);

  const getStatusColor = () => {
    // if (isUnderAttack) return "#ff4444";
    return status === "active" ? "#a1ffb7" : "#ff4229";
  };

  const getStatusText = () => {
    // if (isUnderAttack) return "Under Attack";
    return status === "active" ? "Online" : "Offline";
  };

  return (
    <Chip
      icon={
        <div
          style={{
            width: "8px",
            height: "8px",
            backgroundColor: getStatusColor(),
            borderRadius: "50%",
            animation: loading ? "pulse 1.5s infinite" : "none",
          }}
        />
        // isUnderAttack ? (
        //   <WarningIcon />
        // ) : (
        //   <div
        //     style={{
        //       width: "8px",
        //       height: "8px",
        //       backgroundColor: getStatusColor(),
        //       borderRadius: "50%",
        //       animation: loading ? "pulse 1.5s infinite" : "none",
        //     }}
        //   />
        // )
      }
      label={getStatusText()}
      size="small"
      sx={{
        backgroundColor: `${getStatusColor()}20`,
        color: getStatusColor(),
        fontWeight: 600,
        border: `1px solid ${getStatusColor()}30`,
      }}
    />
  );
};

const Devices = () => {
  const theme = useTheme();
  const { data, isLoading, refetch } = useGetDeviceQuery();
  const [addDevice] = useAddDeviceMutation();
  const [deleteDevice] = useDeleteDeviceMutation();
  const [updateDevice] = useUpdateDeviceMutation();

  // State for viewing device details
  const [viewDevice, setViewDevice] = useState(null);

  // State cho form thêm thiết bị - khởi tạo tất cả field với string
  const [open, setOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: "",
    ip: "",
    port: "", // String thay vì null
  });

  // State cho form chỉnh sửa thiết bị
  const [editOpen, setEditOpen] = useState(false);
  const [editDevice, setEditDevice] = useState({
    name: "",
    ip: "",
    port: "",
    status: "",
    attackers: false,
  });

  // Snackbar cho thông báo
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showNotification = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDeleteDevice = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) {
      try {
        await deleteDevice(id).unwrap();
        refetch();
        showNotification("Xóa thiết bị thành công", "success");
      } catch (error) {
        console.error("Failed to delete device:", error);
        showNotification("Không thể xóa thiết bị", "error");
      }
    }
  };

  const handleViewDevice = (device) => {
    setViewDevice(device);
  };

  // Định nghĩa các cột cho DataGrid
  const columns = [
    {
      field: "name",
      headerName: "Tên thiết bị",
      flex: 1.2,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="text"
            onClick={() => handleViewDevice(params.row)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#FFFFFF", // White text for better contrast
              "&:hover": {
                textDecoration: "underline",
                color: "#E3F2FD", // Light blue on hover
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            {params.row.name || "Unnamed Device"}
          </Button>
          {params.row.attackers && (
            <Chip
              icon={<WarningIcon />}
              label="SQL Injection"
              size="small"
              color="error"
              sx={{ fontSize: "0.7rem" }}
            />
          )}
        </Box>
      ),
    },
    {
      field: "ip",
      headerName: "Địa chỉ IP",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            fontFamily: "monospace",
            fontWeight: 600,
            color: "#FFFFFF", // White text
            fontSize: "0.9rem",
          }}
        >
          {params.row.ip || "N/A"}
        </Box>
      ),
    },
    {
      field: "port",
      headerName: "Port",
      flex: 0.8,
      renderCell: (params) => (
        <Box
          sx={{
            fontFamily: "monospace",
            fontWeight: 600,
            color: "#FFFFFF", // White text
            fontSize: "0.9rem",
          }}
        >
          {params.row.port || "N/A"}
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 1,
      renderCell: (params) => (
        <StatusCell
          ip={params.row.ip}
          port={params.row.port}
          isUnderAttack={params.row.attackers}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Ngày tạo",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            fontSize: "0.85rem",
            color: "#E0E0E0", // Light gray for better contrast
            fontWeight: 500,
          }}
        >
          {params.row.createdAt || "N/A"}
        </Box>
      ),
    },
    {
      field: "updatedAt",
      headerName: "Cập nhật cuối",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            fontSize: "0.85rem",
            color: "#E0E0E0", // Light gray for better contrast
            fontWeight: 500,
          }}
        >
          {params.row.updatedAt || params.row.last_active || "N/A"}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Thao tác",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setEditDevice({
                ...params.row,
                name: params.row.name || "",
                ip: params.row.ip || "",
                port: (params.row.port || "").toString(),
                status: params.row.status || "active",
                attackers: Boolean(params.row.attackers),
              });
              setEditOpen(true);
            }}
            sx={{
              minWidth: "auto",
              px: 1,
              borderColor: "#90CAF9", // Light blue border
              color: "#90CAF9", // Light blue text
              "&:hover": {
                borderColor: "#FFFFFF",
                color: "#FFFFFF",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <EditIcon fontSize="small" />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleDeleteDevice(params.row._id)}
            sx={{
              minWidth: "auto",
              px: 1,
              borderColor: "#F48FB1", // Light red border
              color: "#F48FB1", // Light red text
              "&:hover": {
                borderColor: "#FFCDD2",
                color: "#FFCDD2",
                backgroundColor: "rgba(244, 67, 54, 0.1)",
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </Button>
        </Box>
      ),
    },
  ];

  // Mở/đóng dialog thêm
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewDevice({
      name: "",
      ip: "",
      port: "",
    });
  };

  // Đóng dialog sửa
  const handleEditClose = () => {
    setEditOpen(false);
    setEditDevice({
      name: "",
      ip: "",
      port: "",
      status: "",
      attackers: false,
    });
  };

  // Cập nhật giá trị form thêm
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDevice((prev) => ({ ...prev, [name]: value }));
  };

  // Cập nhật giá trị form sửa
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditDevice((prev) => ({ ...prev, [name]: value }));
  };

  // Thêm thiết bị mới
  const handleAddDevice = async () => {
    try {
      // Validate input
      if (
        !newDevice.name.trim() ||
        !newDevice.ip.trim() ||
        !newDevice.port.trim()
      ) {
        showNotification("Vui lòng điền đầy đủ thông tin", "warning");
        return;
      }

      const deviceData = {
        name: newDevice.name.trim(),
        ip: newDevice.ip.trim(),
        port: newDevice.port.trim(),
      };

      await addDevice(deviceData).unwrap();
      refetch();
      handleClose();
      showNotification("Thêm thiết bị thành công", "success");
    } catch (error) {
      console.error("Failed to add device:", error);
      showNotification("Không thể thêm thiết bị", "error");
    }
  };

  // Chỉnh sửa thiết bị
  const handleEditDevice = async () => {
    try {
      // Validate input
      if (
        !editDevice.name.trim() ||
        !editDevice.ip.trim() ||
        !editDevice.port.toString().trim()
      ) {
        showNotification("Vui lòng điền đầy đủ thông tin", "warning");
        return;
      }

      const deviceData = {
        name: editDevice.name.trim(),
        ip: editDevice.ip.trim(),
        port: editDevice.port.toString().trim(),
        status: editDevice.status,
        attackers: editDevice.attackers,
      };

      await updateDevice({ id: editDevice._id, ...deviceData }).unwrap();
      refetch();
      handleEditClose();
      showNotification("Cập nhật thiết bị thành công", "success");
    } catch (error) {
      console.error("Failed to update device:", error);
      showNotification("Không thể cập nhật thiết bị", "error");
    }
  };

  // Xử lý data từ API
  const devices = data?.data || data || [];

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="GIÁM SÁT" subtitle="Danh sách các thiết bị" />

      {/* Nút thêm thiết bị */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{ mb: 2, mt: 2 }}
      >
        Đăng ký thiết bị
      </Button>

      {/* DataGrid */}
      <Box
        mt="20px"
        height="70vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
            color: "#FFFFFF", // White text for all grid content
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#FFFFFF", // Ensure all cell text is white
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.background.alt,
            color: "#FFFFFF", // White header text
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
            fontWeight: 700,
            fontSize: "0.95rem",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            color: "#FFFFFF", // Explicit white for column titles
            fontWeight: 700,
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: theme.palette.primary.light,
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: theme.palette.background.alt,
            color: "#FFFFFF", // White footer text
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: "#FFFFFF !important", // White toolbar text
          },
          "& .MuiTablePagination-root": {
            color: "#FFFFFF", // White pagination text
          },
          "& .MuiTablePagination-selectLabel": {
            color: "#FFFFFF",
          },
          "& .MuiTablePagination-displayedRows": {
            color: "#FFFFFF",
          },
          "& .MuiSelect-select": {
            color: "#FFFFFF",
          },
          "& .MuiIconButton-root": {
            color: "#FFFFFF",
          },
          "& .MuiDataGrid-row": {
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            },
          },
          "& .MuiDataGrid-cellContent": {
            color: "#FFFFFF",
          },
        }}
      >
        <DataGrid
          loading={isLoading}
          getRowId={(row) => row._id || row.name || Math.random()}
          rows={devices}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          disableSelectionOnClick
        />
      </Box>

      {/* Dialog xem chi tiết */}
      <Dialog
        open={viewDevice !== null}
        onClose={() => setViewDevice(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết thiết bị</DialogTitle>
        <DialogContent>
          {viewDevice && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
            >
              <TextField
                label="Tên thiết bị"
                value={viewDevice.name || ""}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Địa chỉ IP"
                  value={viewDevice.ip || ""}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Port"
                  value={viewDevice.port || ""}
                  InputProps={{ readOnly: true }}
                />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Trạng thái"
                  value={viewDevice.status || ""}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Bị tấn công"
                  value={viewDevice.attackers ? "Có" : "Không"}
                  InputProps={{ readOnly: true }}
                />
              </Box>
              <TextField
                label="Ngày tạo"
                value={viewDevice.createdAt || ""}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Cập nhật cuối"
                value={viewDevice.updatedAt || viewDevice.last_active || ""}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDevice(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog thêm thiết bị */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm thiết bị mới</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Tên thiết bị"
              name="name"
              value={newDevice.name}
              onChange={handleChange}
              fullWidth
              required
              placeholder="Nhập tên thiết bị"
            />
            <TextField
              label="Địa chỉ IP"
              name="ip"
              value={newDevice.ip}
              onChange={handleChange}
              fullWidth
              required
              placeholder="192.168.1.100"
            />
            <TextField
              label="Port"
              name="port"
              value={newDevice.port}
              onChange={handleChange}
              fullWidth
              required
              placeholder="3000"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleAddDevice} variant="contained">
            Thêm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog sửa thiết bị */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa thiết bị</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Tên thiết bị"
              name="name"
              value={editDevice.name}
              onChange={handleEditChange}
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Địa chỉ IP"
                name="ip"
                value={editDevice.ip}
                onChange={handleEditChange}
              />
              <TextField
                label="Port"
                name="port"
                value={editDevice.port}
                onChange={handleEditChange}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Hủy</Button>
          <Button onClick={handleEditDevice} variant="contained">
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Devices;
