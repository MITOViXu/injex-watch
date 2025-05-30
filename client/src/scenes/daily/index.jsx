import React, { useMemo, useState } from "react";
import { Box, useTheme } from "@mui/material";
import Header from "components/Header";
import { ResponsiveLine } from "@nivo/line";
import { useGetAllAttackersQuery } from "state/api"; // Giả sử sử dụng hook lấy dữ liệu attackers
import DatePicker from "react-datepicker";
import { parse } from "date-fns"; // Import parse từ date-fns
import "react-datepicker/dist/react-datepicker.css";

const Daily = () => {
  const [startDate, setStartDate] = useState(new Date("2025-04-01"));
  const [endDate, setEndDate] = useState(new Date("2025-04-16"));
  const { data } = useGetAllAttackersQuery();
  const theme = useTheme();

  const [formattedData] = useMemo(() => {
    if (!data) return [];

    console.log("Data: ", data); // Kiểm tra dữ liệu ban đầu
    const attackLine = {
      id: "attacks",
      color: theme.palette.secondary.main,
      data: [],
    };

    const attacksByDate = {};

    data.forEach((attacker) => {
      // Chuyển đổi ngày tháng từ chuỗi "DD/MM/YYYY HH:mm:ss" thành đối tượng Date hợp lệ
      const attackDate = parse(
        attacker.latest_attack,
        "HH:mm:ss dd/MM/yyyy",
        new Date()
      );

      if (isNaN(attackDate)) {
        console.warn("Invalid Date for attacker:", attacker);
        return; // Nếu là "Invalid Date", bỏ qua phần tử này
      }

      console.log("Attack Date: ", attackDate);

      if (attackDate >= startDate && attackDate <= endDate) {
        const dateString = attackDate.toISOString().split("T")[0]; // Chuyển đổi sang định dạng YYYY-MM-DD
        attacksByDate[dateString] = (attacksByDate[dateString] || 0) + 1;
      }
    });

    console.log("Attacks by Date: ", attacksByDate); // Kiểm tra kết quả nhóm dữ liệu

    Object.keys(attacksByDate).forEach((date) => {
      attackLine.data.push({ x: date, y: attacksByDate[date] });
    });

    const formattedData = [attackLine];
    return [formattedData];
  }, [data, startDate, endDate]);

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="Hoạt động của kẻ tấn công" subtitle="Tính theo ngày" />
      <Box height="75vh">
        <Box display="flex" justifyContent="flex-end">
          <Box>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
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
            />
          </Box>
        </Box>

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
            margin={{ top: 50, right: 50, bottom: 70, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            yFormat=" >-.2f"
            curve="catmullRom"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              orient: "bottom",
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 90,
              legend: "Date",
              legendOffset: 60,
              legendPosition: "middle",
            }}
            axisLeft={{
              orient: "left",
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Number of Attacks",
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
          <>Loading...</>
        )}
      </Box>
    </Box>
  );
};

export default Daily;
