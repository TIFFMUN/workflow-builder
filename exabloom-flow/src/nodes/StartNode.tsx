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
        <img src="https://www.svgrepo.com/show/106364/chat.svg" alt="start" />
        <div>
          <strong>{data.label}</strong>
          <div className="subtext">Start</div>
        </div>
      </div>
    </div>
  );
};

export default StartNode;
