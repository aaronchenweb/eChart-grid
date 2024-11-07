import {} from "react";
import "./index.css";
// import { baseTheme } from "@chakra-ui/theme";
// import { Provider } from "@chakra-ui/react/provider";
// import Sidebar from "./Sidebar";
import Grid from "./Grid";

export default function App() {
  // const echartsDom = useRef(null);
  // useEffect(() => {
  //   const myChart = echarts.init(echartsDom.current);
  //   let option = {
  //     title: {
  //       text: "Referer of a Website",
  //       subtext: "Fake Data",
  //       left: "center",
  //     },
  //     tooltip: {
  //       trigger: "item",
  //     },
  //     legend: {
  //       orient: "vertical",
  //       left: "left",
  //     },
  //     series: [
  //       {
  //         name: "Access From",
  //         type: "pie",
  //         radius: "50%",
  //         data: [
  //           { value: 1048, name: "Search Engine" },
  //           { value: 735, name: "Direct" },
  //           { value: 580, name: "Email" },
  //           { value: 484, name: "Union Ads" },
  //           { value: 300, name: "Video Ads" },
  //         ],
  //         emphasis: {
  //           itemStyle: {
  //             shadowBlur: 10,
  //             shadowOffsetX: 0,
  //             shadowColor: "rgba(0, 0, 0, 0.5)",
  //           },
  //         },
  //       },
  //     ],
  //   };
  //   // 绘制图表
  //   myChart.setOption(option);
  // }, []);
  {
    /* <div ref={echartsDom} style={{ height: 800, width: 800 }} /> */
  }
  return (
    <>
      <Grid />
    </>
  );
}
// 需求一 選擇數據, 需求二 選擇圖表類型, 需求三, 圖表三等份, 需求三,可拖曳圖表到下一行欄位
