import React from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

const App = () => {
  return (
    <ReactFlowProvider>
      <div style={{ width: "100vw", height: "100vh" }}>
        <ReactFlow nodes={[]} edges={[]} fitView>
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default App;
