import { useState, useEffect, memo, useCallback, useRef } from "react";
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import EChart from "./EChart";
import { Modal } from "antd";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const chartTypes = ["pie", "bar", "line"];

const generateInitialCharts = (count) => {
  return _.map(_.range(0, count), (i) => ({
    title: `Chart ${i + 1}`,
    chartType: _.sample(chartTypes),
    chartData: [
      { value: _.random(500, 2000), name: "Search Engine" },
      { value: _.random(300, 1500), name: "Direct" },
      { value: _.random(200, 1000), name: "Email" },
      { value: _.random(100, 800), name: "Social" },
      { value: _.random(50, 500), name: "Other" },
    ],
  }));
};

const generateLayout = (count) => {
  return _.map(_.range(0, count), function (item, i) {
    const minWidth = 4;
    const minHeight = 8;
    const maxWidth = 12;
    const maxHeight = 10;
    return {
      x: (i * minWidth) % 12,
      y: Math.floor(i / (12 / minWidth)) * minHeight,
      w: _.random(minWidth, maxWidth), // Random width
      h: _.random(minHeight, maxHeight), // Random height
      i: i.toString(),
      static: false,
      minW: minWidth,
      minH: minHeight,
    };
  });
};

// Memoized chart component with improved performance
const MemoizedChartContainer = memo(
  ({ chart, isInteracting, itemId, onChartInit, isSelected }) => {
    return (
      <div className="bg-slate-50 rounded-lg overflow-hidden shadow-2xl h-full">
        <div className="p-4 h-full flex flex-col">
          <div className="text-gray-800 text-lg font-semibold mb-2">
            {chart.title}
          </div>
          <div className="flex-grow">
            <EChart
              data={chart.chartData}
              chartType={chart.chartType}
              id={chart.title}
              skipRender={isInteracting && !isSelected}
              key={`chart-${itemId}`}
              onChartInit={(instance) => onChartInit(itemId, instance)}
            />
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      _.isEqual(prevProps.chart, nextProps.chart) &&
      prevProps.isInteracting === nextProps.isInteracting &&
      prevProps.isSelected === nextProps.isSelected
    );
  }
);

const defaultProps = {
  className: "layout",
  rowHeight: 30,
  onLayoutChange: function () {},
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  initialLayout: generateLayout(20),
  margin: [16, 16],
  // maxRows: 10,
};

const ShowcaseLayout = (props) => {
  const mergedProps = { ...defaultProps, ...props };
  const chartInstancesRef = useRef({});
  const [selectedItemId, setSelectedItemId] = useState(null);

  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const [compactType, setCompactType] = useState("vertical");
  const [mounted, setMounted] = useState(false);
  const [interactionState, setInteractionState] = useState({
    isDragging: false,
    isResizing: false,
    activeItemId: null,
  });

  const [charts, setCharts] = useState(generateInitialCharts(20));
  const [layouts, setLayouts] = useState({
    lg: generateLayout(20),
  });

  const handleChartInit = (itemId, chartInstance) => {
    chartInstancesRef.current[itemId] = chartInstance;
  };

  const isInteracting = useCallback(
    (itemId) => {
      return (
        (interactionState.isDragging || interactionState.isResizing) &&
        interactionState.activeItemId === itemId
      );
    },
    [interactionState]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateDOM = () => {
    return charts.map((chart, i) => (
      <div
        key={i.toString()}
        style={{ width: "100%", height: "100%" }}
        onClick={() => setSelectedItemId(i.toString())}
      >
        <MemoizedChartContainer
          chart={chart}
          isInteracting={isInteracting(i.toString())}
          isSelected={selectedItemId === i.toString()}
          itemId={i.toString()}
          onChartInit={handleChartInit}
        />
      </div>
    ));
  };

  const onDragStart = (layouts, oldItem, newItem, placeholder, e, element) => {
    setInteractionState((prev) => ({
      ...prev,
      isDragging: true,
      activeItemId: oldItem.i,
    }));
    setSelectedItemId(oldItem.i);
  };

  const onDragStop = (layouts, oldItem, newItem, placeholder, e, element) => {
    setInteractionState((prev) => ({
      ...prev,
      isDragging: false,
      activeItemId: null,
    }));
    const chartInstance = chartInstancesRef.current[oldItem.i];
    if (chartInstance) {
      requestAnimationFrame(() => {
        chartInstance.resize();
      });
    }
  };

  const onResizeStart = (
    layouts,
    oldItem,
    newItem,
    placeholder,
    e,
    element
  ) => {
    setInteractionState((prev) => ({
      ...prev,
      isResizing: true,
      activeItemId: oldItem.i,
    }));
    setSelectedItemId(oldItem.i);
  };

  const onResizeStop = (layouts, oldItem, newItem, placeholder, e, element) => {
    setInteractionState((prev) => ({
      ...prev,
      isResizing: false,
      activeItemId: null,
    }));

    const chartInstance = chartInstancesRef.current[oldItem.i];
    if (chartInstance) {
      requestAnimationFrame(() => {
        chartInstance.resize();
      });
    }
  };

  useEffect(() => {
    const currentChartInstances = chartInstancesRef.current;

    return () => {
      // Use the captured value of chartInstances in cleanup
      Object.values(currentChartInstances).forEach((instance) => {
        if (instance) {
          instance.dispose();
        }
      });
    };
  }, []);

  const onBreakpointChange = (breakpoint) => {
    setCurrentBreakpoint(breakpoint);
  };

  const onCompactTypeChange = () => {
    setCompactType((oldCompactType) => {
      if (oldCompactType === "horizontal") return "vertical";
      if (oldCompactType === "vertical") return null;
      return "horizontal";
    });
  };

  const onLayoutChange = (layout, layouts) => {
    const validatedLayout = layout.map((item) => ({
      ...item,
      w: Math.max(item.w, defaultProps.initialLayout[0].minW),
      h: Math.max(item.h, defaultProps.initialLayout[0].minH),
    }));

    setLayouts({ ...layouts, [currentBreakpoint]: validatedLayout });
    mergedProps.onLayoutChange(validatedLayout, layouts);
  };

  const onNewLayout = () => {
    const newLayout = generateLayout(charts.length);
    setLayouts({ lg: newLayout });
  };

  const handleAddChart = (chartType, title) => {
    const sampleData = [
      { value: _.random(500, 2000), name: "Search Engine" },
      { value: _.random(300, 1500), name: "Direct" },
      { value: _.random(200, 1000), name: "Email" },
      { value: _.random(100, 800), name: "Social" },
      { value: _.random(50, 500), name: "Other" },
    ];

    const newChart = {
      title:
        title ||
        `New ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
      chartData: sampleData,
      chartType: chartType,
    };

    setCharts((prevCharts) => {
      const newCharts = [...prevCharts, newChart];
      setLayouts({
        lg: generateLayout(newCharts.length),
      });
      return newCharts;
    });
  };

  return (
    <div className="bg-slate-100 p-6 min-h-screen">
      <div className="text-gray-800 mb-2">
        Current Breakpoint: {currentBreakpoint} (
        {mergedProps.cols[currentBreakpoint]} columns)
      </div>
      <div className="text-gray-800 mb-4">
        Compaction type: {_.capitalize(compactType) || "No Compaction"}
      </div>
      <div className="flex gap-2 mb-6">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          onClick={onNewLayout}
        >
          Generate New Layout
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          onClick={onCompactTypeChange}
        >
          Change Compaction Type
        </button>
        <AddCard onAdd={handleAddChart} />
      </div>

      <ResponsiveReactGridLayout
        {...mergedProps}
        layouts={layouts}
        onBreakpointChange={setCurrentBreakpoint}
        onLayoutChange={onLayoutChange}
        measureBeforeMount={false}
        useCSSTransforms={mounted}
        compactType={compactType}
        preventCollision={!compactType}
        onDragStart={onDragStart}
        onDragStop={onDragStop}
        onResizeStart={onResizeStart}
        onResizeStop={onResizeStop}
      >
        {generateDOM()}
      </ResponsiveReactGridLayout>
    </div>
  );
};

// AddCard component with updated styling
const AddCard = ({ onAdd }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const handleSelectChart = (chartType) => {
    onAdd(chartType, title);
    setAdding(false);
    setTitle("");
  };

  return (
    <>
      <ChartTypeModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        onSelectChart={handleSelectChart}
      />
      {adding ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chart Title (optional)"
            className="rounded border border-blue-400 py-2 px-4 text-gray placeholder-gray-400 focus:outline-none focus:border-black-500"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdding(false)}
              className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              <span>Select Chart +</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <span>Add Chart +</span>
        </button>
      )}
    </>
  );
};

// ChartTypeModal with updated styling
const ChartTypeModal = ({ open, setOpen, onSelectChart }) => {
  const [selectedType, setSelectedType] = useState("pie");
  const chartTypes = [{ type: "pie" }, { type: "bar" }, { type: "line" }];

  return (
    <>
      <Modal
        centered
        closable={false}
        title="Select Chart Type"
        open={open}
        footer={[
          <button
            key="add"
            onClick={() => {
              onSelectChart(selectedType);
              setOpen(false);
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Chart
          </button>,
          <button
            key="cancel"
            onClick={() => setOpen(false)}
            className="ml-2 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
          >
            Cancel
          </button>,
        ]}
      >
        <div className="grid grid-cols-3 gap-4">
          {chartTypes.map((chart) => (
            <button
              key={chart.type}
              className={`p-4 cursor-pointer border rounded-lg ${
                selectedType === chart.type
                  ? "border-blue-400 bg-blue-500"
                  : "border-blue-600 hover:border-blue-400 hover:bg-blue-500"
              }`}
              onClick={() => setSelectedType(chart.type)}
            >
              <p className="text-center capitalize text-white">{chart.type}</p>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default ShowcaseLayout;
