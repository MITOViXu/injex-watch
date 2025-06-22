import React, { useMemo, useState } from "react";
import { Box, useTheme } from "@mui/material";
import Header from "components/Header";
import { ResponsiveLine } from "@nivo/line";
import { useGetAllAttackersQuery } from "state/api";
import DatePicker from "react-datepicker";
import { parse } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

const Daily = () => {
  // Mặc định: Start date = 1/4/2025, End date = 20/6/2025
  const [startDate, setStartDate] = useState(new Date("2025-04-01"));
  const [endDate, setEndDate] = useState(new Date("2025-06-20"));

  const { data } = useGetAllAttackersQuery();
  const theme = useTheme();

  const [formattedData] = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      console.log("No data available");
      return [[]];
    }

    console.log("Raw data: ", data);
    console.log("Date range:", startDate, "to", endDate);

    const attacksByDate = {};

    data.forEach((attacker) => {
      console.log("Processing attacker:", attacker);

      // Parse ngày từ format "HH:mm:ss dd/MM/yyyy" thành Date object
      const attackDate = parse(
        attacker.latest_attack,
        "HH:mm:ss dd/MM/yyyy",
        new Date()
      );

      console.log("Parsed date:", attackDate, "from:", attacker.latest_attack);

      // Skip nếu ngày không hợp lệ
      if (isNaN(attackDate)) {
        console.warn("Invalid date for attacker:", attacker);
        return;
      }

      // Reset time để so sánh chỉ theo ngày
      const attackDateOnly = new Date(
        attackDate.getFullYear(),
        attackDate.getMonth(),
        attackDate.getDate()
      );
      const startDateOnly = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
      const endDateOnly = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );

      // Chỉ lấy dữ liệu trong khoảng thời gian được chọn
      if (attackDateOnly >= startDateOnly && attackDateOnly <= endDateOnly) {
        const dateString = attackDateOnly.toISOString().split("T")[0]; // Format: YYYY-MM-DD
        attacksByDate[dateString] = (attacksByDate[dateString] || 0) + 1;
      }
    });

    console.log("Grouped attacks by date: ", attacksByDate);

    // Tạo data cho chart
    const attackLine = {
      id: "attacks",
      color: theme.palette.secondary.main,
      data: [],
    };

    // Chuyển đổi object thành array data cho chart và sort theo ngày
    const sortedEntries = Object.entries(attacksByDate).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    sortedEntries.forEach(([date, count]) => {
      attackLine.data.push({ x: date, y: count });
    });

    console.log("Final chart data:", [attackLine]);

    return [[attackLine]];
  }, [data, startDate, endDate, theme.palette.secondary.main]);

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="Hoạt động của kẻ tấn công" subtitle="Tính theo ngày" />

      <Box height="75vh">
        {/* Date Range Picker */}
        <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
          <Box>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Từ ngày"
              dateFormat="dd/MM/yyyy"
            />
          </Box>
          <Box>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="Đến ngày"
              dateFormat="dd/MM/yyyy"
            />
          </Box>
        </Box>

        {/* Chart */}
        {data ? (
          <ResponsiveLine
            data={formattedData}
            theme={{
              axis: {
                domain: {
                  line: {
                    stroke: theme.palette.secondary[200],
                  },
                },
                legend: {
                  text: {
                    fill: theme.palette.secondary[200],
                  },
                },
                ticks: {
                  line: {
                    stroke: theme.palette.secondary[200],
                    strokeWidth: 1,
                  },
                  text: {
                    fill: theme.palette.secondary[200],
                  },
                },
              },
              legends: {
                text: {
                  fill: theme.palette.secondary[200],
                },
              },
              tooltip: {
                container: {
                  color: theme.palette.primary.main,
                },
              },
            }}
            colors={{ datum: "color" }}
            margin={{ top: 50, right: 50, bottom: 90, left: 60 }}
            xScale={{
              type: "time",
              format: "%Y-%m-%d",
              useUTC: false,
              precision: "day",
            }}
            xFormat="time:%Y-%m-%d"
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            yFormat=" >-.0f"
            curve="catmullRom"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              orient: "bottom",
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 45,
              legend: "Ngày",
              legendOffset: 60,
              legendPosition: "middle",
              format: "%d/%m",
              tickValues: "every 3 days",
            }}
            axisLeft={{
              orient: "left",
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Số lượng tấn công",
              legendOffset: -50,
              legendPosition: "middle",
            }}
            enableGridX={false}
            enableGridY={false}
            pointSize={10}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            useMesh={true}
            legends={[
              {
                anchor: "top-right",
                direction: "column",
                justify: false,
                translateX: 50,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: "left-to-right",
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemBackground: "rgba(0, 0, 0, .03)",
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
          />
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            Đang tải dữ liệu...
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Daily;
