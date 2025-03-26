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
import {
  useGetDeviceQuery,
  useAddDeviceMutation,
  useDeleteDeviceMutation,
  useUpdateDeviceMutation,
} from "state/api";
import Header from "components/Header";
import { DataGrid } from "@mui/x-data-grid";

// Hàm kiểm tra trạng thái website dựa trên IP
const checkWebsiteStatus = async (ip, port) => {
  try {
    const strPort = port.toString();
    const url = `http://${ip}:${strPort}`;
    console.log("Địa chỉ URL:", url);
    console.log("port:", strPort);
    const response = await fetch(url);
    console.log("Thông tin trả về:", response);
    return response.ok;
  } catch (error) {
    console.error("Error checking website status:", error);
    return false;
  }
};

const StatusCell = ({ ip, port }) => {
  const [status, setStatus] = useState("inactive");

  useEffect(() => {
    const fetchStatus = async () => {
      const isActive = await checkWebsiteStatus(ip, port);
      setStatus(isActive ? "active" : "inactive");
    };

    // Gọi lần đầu khi component được mount
    fetchStatus();

    // Thiết lập interval gọi hàm fetchStatus mỗi 3 giây
    const interval = setInterval(fetchStatus, 3000);

    // Dọn dẹp interval khi component unmount
    return () => clearInterval(interval);
  }, [ip, port]);

  return (
    <span
      style={{
        display: "flex",
        gap: "5px",
        alignItems: "center",
        color: status === "active" ? "#96ff9d" : "red",
        fontWeight: "bold",
      }}
    >
      <div
        style={{
          width: "12px",
          height: "12px",
          backgroundColor: status === "active" ? "#96ff9d" : "red",
          borderRadius: "50%",
        }}
      ></div>
      {status}
    </span>
  );
};

const Devices = () => {
  const theme = useTheme();
  const { data, isLoading, refetch } = useGetDeviceQuery(); // refetch để cập nhật lại data sau khi thêm
  const [addDevice] = useAddDeviceMutation();
  const [deleteDevice] = useDeleteDeviceMutation();
  const [updateDevice] = useUpdateDeviceMutation();

  // State cho form thêm thiết bị
  const [open, setOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: "",
    ip: "",
    port: null,
  });
  const handleEditClose = () => {
    setEditOpen(false);
    setEditDevice(null);
  };
  // State cho form chỉnh sửa thiết bị
  const [editOpen, setEditOpen] = useState(false);
  const [editDevice, setEditDevice] = useState(null);

  const handleDeleteDevice = async (id) => {
    try {
      await deleteDevice(id).unwrap();
      refetch(); // Cập nhật lại danh sách sau khi xoá
    } catch (error) {
      console.error("Failed to delete device:", error);
    }
  };
  // Định nghĩa các cột cho DataGrid
  const columns = [
    { field: "name", headerName: "Tên thiết bị", flex: 1 },
    { field: "ip", headerName: "Địa chỉ IP", flex: 1 },
    { field: "port", headerName: "Port", flex: 1 },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 1,
      // Sử dụng component StatusCell, truyền ip của dòng dữ liệu
      renderCell: (params) => (
        <StatusCell ip={params.row.ip} port={params.row.port} />
      ),
    },
    { field: "createdAt", headerName: "Thêm ngày", flex: 1 },
    // { field: "updatedAt", headerName: "Cập nhật cuối", flex: 1 },
    {
      field: "actions",
      headerName: "Thao tác",
      flex: 1,
      renderCell: (params) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            variant="outlined"
            style={{
              color: "#fff", // Màu chữ trắng
              borderColor: "#fff", // Viền trắng
              backgroundColor: "transparent", // Nền trong suốt (hoặc đổi thành màu mong muốn)
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)", // Nền trắng mờ khi hover
                borderColor: "#fff",
              },
            }}
            onClick={() => {
              setEditDevice(params.row);
              setEditOpen(true);
            }}
          >
            Chỉnh sửa
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleDeleteDevice(params.row._id)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  // Mở/đóng dialog
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Cập nhật giá trị form khi người dùng nhập
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDevice((prev) => ({ ...prev, [name]: value }));
  };

  // Thêm thiết bị mới
  const handleAddDevice = async () => {
    try {
      await addDevice(newDevice).unwrap();
      refetch();
      setOpen(false);
      setNewDevice({ name: "", ip: "" });
    } catch (error) {
      console.error("Failed to add device:", error);
    }
  };

  // Chỉnh sửa thiết bị
  const handleEditDevice = async () => {
    try {
      await updateDevice({ id: editDevice._id, ...editDevice }).unwrap();
      refetch();
      setEditOpen(false);
      setEditDevice(null);
    } catch (error) {
      console.error("Failed to update device:", error);
    }
  };

  // Cập nhật giá trị form chỉnh sửa
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditDevice((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="DEVICES" subtitle="List of Devices" />

      {/* Nút mở dialog thêm thiết bị */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{ mb: 2 }}
      >
        Add Device
      </Button>

      <Box
        mt="20px"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[100],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: theme.palette.primary.light,
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[100],
            borderTop: "none",
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${theme.palette.secondary[200]} !important`,
          },
        }}
      >
        <DataGrid
          loading={isLoading || !data}
          getRowId={(row) => row.name}
          rows={data || []}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Box>

      {/* Dialog để thêm thiết bị */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Device</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên thiết bị"
            type="text"
            fullWidth
            name="name"
            value={newDevice.name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Địa chỉ IP"
            type="text" // Địa chỉ IP là chuỗi nên dùng type="text"
            fullWidth
            name="ip"
            value={newDevice.ip}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Port"
            type="number" // Port là số nên dùng type="number"
            fullWidth
            name="port" // Đổi name để không bị trùng với ip
            value={newDevice.port}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddDevice} sx={{ color: "#88ccfc" }}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form chỉnh sửa */}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Device</DialogTitle>
        <DialogContent>
          <TextField
            name="name"
            label="Name"
            value={editDevice?.name || ""}
            onChange={handleEditChange}
            fullWidth
            margin="dense"
          />
          <TextField
            name="ip"
            label="IP"
            value={editDevice?.ip || ""}
            onChange={handleEditChange}
            fullWidth
            margin="dense"
          />
          <TextField
            name="port"
            label="Port"
            value={editDevice?.port || ""}
            onChange={handleEditChange}
            fullWidth
            margin="dense"
            type="number"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditDevice}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Devices;
