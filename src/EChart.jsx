import { useRef, useEffect, useState, useCallback } from "react";
import * as echarts from "echarts";
import _ from "lodash";

const EChart = ({
  data,
  chartType = "pie",
  preview = false,
  id,
  onChartReady,
  skipRender = false,
  onChartInit,
}) => {
  const echartsDom = useRef(null);
  const chartInstance = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const previousSkipRender = useRef(skipRender);

  const initChart = useCallback(() => {
    if (!echartsDom.current || skipRender) return;

    const container = echartsDom.current;
    if (
      !container ||
      container.clientWidth === 0 ||
      container.clientHeight === 0
    )
      return;

    // Initialize chart if it doesn't exist
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(container);
      onChartInit && onChartInit(chartInstance.current);
    }

    previousSkipRender.current = skipRender;

    const option = {
      animation: true,
      tooltip: {
        trigger: "item",
      },
      legend: {
        top: preview ? "15%" : "5%",
        left: "center",
        textStyle: {
          color: "#1f2937",
        },
      },
      ...getChartOptions(chartType, data, preview),
    };

    try {
      chartInstance.current.setOption(option);
      onChartReady && onChartReady();
    } catch (error) {
      console.error("Failed to set chart options:", error);
    }
  }, [data, chartType, preview, onChartReady, skipRender, onChartInit]);

  // Resize observer effect with improved performance
  useEffect(() => {
    if (!echartsDom.current) return;

    const resizeObserver = new ResizeObserver(
      _.debounce((entries) => {
        const entry = entries[0];
        if (entry && !skipRender) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            setContainerSize({ width, height });
            if (chartInstance.current) {
              requestAnimationFrame(() => {
                chartInstance.current.resize();
              });
            }
          }
        }
      }, 100)
    );

    resizeObserver.observe(echartsDom.current);

    return () => {
      resizeObserver.disconnect();
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [skipRender]);

  // Init effect with requestAnimationFrame
  useEffect(() => {
    if (!skipRender) {
      const timer = requestAnimationFrame(initChart);
      return () => cancelAnimationFrame(timer);
    }
  }, [initChart, containerSize, skipRender]);

  return (
    <div className="h-full w-full">
      <div ref={echartsDom} className="h-full w-full min-h-[200px]" />
    </div>
  );
};

// Helper function to get chart options based on type
const getChartOptions = (chartType, data, preview) => {
  switch (chartType) {
    case "pie":
      return {
        series: [
          {
            name: "Data",
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: preview ? 12 : 20,
                fontWeight: "bold",
                color: "#1f2937",
              },
            },
            labelLine: {
              show: false,
            },
            data: data,
          },
        ],
      };

    case "bar":
      return {
        xAxis: {
          type: "category",
          data: data.map((item) => item.name),
          axisLabel: {
            color: "#1f2937",
            rotate: 45,
            interval: 0,
          },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            color: "#1f2937",
          },
        },
        grid: {
          containLabel: true,
          left: "3%",
          right: "4%",
          bottom: "15%",
        },
        series: [
          {
            data: data.map((item) => item.value),
            type: "bar",
            itemStyle: {
              borderRadius: 6,
            },
          },
        ],
      };

    case "line":
      return {
        xAxis: {
          type: "category",
          data: data.map((item) => item.name),
          axisLabel: {
            color: "#1f2937",
            rotate: 45,
            interval: 0,
          },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            color: "#1f2937",
          },
        },
        grid: {
          containLabel: true,
          left: "3%",
          right: "4%",
          bottom: "15%",
        },
        series: [
          {
            data: data.map((item) => item.value),
            type: "line",
            smooth: true,
          },
        ],
      };

    default:
      return {};
  }
};

export default EChart;
