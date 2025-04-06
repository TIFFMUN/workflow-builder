import React from "react";
import { Handle, Position } from "reactflow";
import "./ActionNode.css";

interface ActionNodeProps {
  data: {
    label: string; // Label for the Action Node
  };
}

const ActionNode: React.FC<ActionNodeProps> = ({ data }) => {
  return (
    <div className="action-node">
      <Handle type="target" position={Position.Top} />
      <div className="action-node-content">
        <img
          src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
          alt="action"
        />
        <strong>{data.label}</strong> {/* Dynamically displaying the name */}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default ActionNode;
