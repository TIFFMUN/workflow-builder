import React from "react";
import { Handle, Position } from "reactflow";
import "./StartNode.css";

interface StartNodeProps {
  data: {
    label: string; // Label for the Start Node
  };
}

const StartNode: React.FC<StartNodeProps> = ({ data }) => {
  return (
    <div className="start-node">
      <Handle type="source" position={Position.Bottom} />
      <div className="start-node-content">
        <img
          src="https://cdn-icons-png.flaticon.com/512/10339/10339656.png"
          alt="start"
        />
        <div>
          <strong>{data.label}</strong> {/* Dynamically displaying the name */}
          <div className="subtext">Start</div>
        </div>
      </div>
    </div>
  );
};

export default StartNode;
