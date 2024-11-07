import { useState } from "react";
import ShowcaseLayout from "./Grid_ShowcaseLayout";

const Grid = () => {
  // Replace class state with useState hook
  const [layout, setLayout] = useState([]);

  // Convert class method to regular function
  const onLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  // Convert class method to regular function
  const stringifyLayout = () => {
    return layout.map((l) => (
      <div className="layoutItem" key={l.i}>
        <b>{l.i}</b>: [{l.x}, {l.y}, {l.w}, {l.h}]
      </div>
    ));
  };

  // Render method becomes return statement
  return (
    <div>
      <div className="layoutJSON shadow-sm bg-white rounded-lg">
        Displayed as <code>[x, y, w, h]</code>:
        <div className="columns">{stringifyLayout()}</div>
      </div>
      <ShowcaseLayout onLayoutChange={onLayoutChange} />
    </div>
  );
};

export default Grid;
