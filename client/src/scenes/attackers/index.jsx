import React, { useState } from "react";
import {
  Box,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useGetAllAttackersQuery } from "state/api";
import Header from "components/Header";
import DataGridCustomToolbar from "components/DataGridCustomToolbar";

// Icon cho marker
const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2776/2776067.png",
  iconSize: [32, 32],
});

const Attackers = () => {
  const theme = useTheme();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState({});
  const [search, setSearch] = useState("");

  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useGetAllAttackersQuery({
    page,
    pageSize,
    sort: JSON.stringify(sort),
    search,
  });

  // State cho Dialog và dữ liệu của kẻ tấn công
  const [selectedAttacker, setSelectedAttacker] = useState(null);

  const handleClose = () => {
    setSelectedAttacker(null);
  };

  const columns = [
    {
      field: "_id",
      headerName: "ID",
      flex: 1,
    },
    {
      field: "ip",
      headerName: "IP Address",
      flex: 1,
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            // color: theme.palette.primary.main,
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() => setSelectedAttacker(params.row)}
        >
          Lat: {params.value.latitude}, Long: {params.value.longitude}
        </Box>
      ),
    },
    {
      field: "latest_attack",
      headerName: "Last Attack",
      flex: 1,
    },
    {
      field: "devices",
      headerName: "# of Devices",
      flex: 0.5,
      sortable: false,
      renderCell: (params) => params.value.length,
    },
  ];

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="TIN TẶC" subtitle="Danh sách các kẻ tấn công" />
      <Box
        height="80vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
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
          getRowId={(row) => row._id}
          rows={data || []}
          columns={columns}
          rowCount={(data && data.total) || 0}
          rowsPerPageOptions={[20, 50, 100]}
          pagination
          page={page}
          pageSize={pageSize}
          paginationMode="server"
          sortingMode="server"
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          onSortModelChange={(newSortModel) => setSort(...newSortModel)}
          components={{ Toolbar: DataGridCustomToolbar }}
          componentsProps={{
            toolbar: { searchInput, setSearchInput, setSearch },
          }}
        />
      </Box>

      {/* Dialog để hiển thị bản đồ */}
      <Dialog
        open={!!selectedAttacker}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Thông tin kẻ tấn công</DialogTitle>
        <DialogContent>
          {selectedAttacker && (
            <Box>
              <p>
                <strong>ID:</strong> {selectedAttacker._id}
              </p>
              <p>
                <strong>IP Address:</strong> {selectedAttacker.ip}
              </p>
              <p>
                <strong>Location:</strong> Lat:{" "}
                {selectedAttacker.location.latitude}, Long:{" "}
                {selectedAttacker.location.longitude}
              </p>
              {/* Hiển thị bản đồ */}
              <Box height="400px" mt={2}>
                <MapContainer
                  center={[
                    selectedAttacker.location.latitude,
                    selectedAttacker.location.longitude,
                  ]}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker
                    position={[
                      selectedAttacker.location.latitude,
                      selectedAttacker.location.longitude,
                    ]}
                    icon={customIcon}
                  >
                    <Popup>
                      Kẻ tấn công tại vị trí:
                      <br />
                      Lat: {selectedAttacker.location.latitude}, Long:{" "}
                      {selectedAttacker.location.longitude}
                    </Popup>
                  </Marker>
                </MapContainer>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Attackers;
