import React from "react";
import { Handle, Position } from "reactflow";
import "./EndNode.css";

// Define the types for props
interface EndNodeProps {
  data: {
    label: string; // Label for the End Node
  };
}

const EndNode: React.FC<EndNodeProps> = ({ data }) => {
  return (
    <div className="end-node">
      <Handle type="target" position={Position.Top} />
      <strong>{data.label}</strong> {/* Dynamically displaying the label */}
    </div>
  );
};

export default EndNode;
