import React from "react";
import { Handle, Position } from "reactflow";
import "./IfElseNode.css";

const IfElseNode = ({ data }: { data: { label: string } }) => {
  return (
    <div className="if-else-node">
      <Handle type="target" position={Position.Top} />
      <div className="if-else-node-content">
        <img
          src="https://cdn-icons-png.flaticon.com/512/10237/10237480.png"
          alt="if-else"
          width={20}
        />
        <strong>{data.label || "If / Else"}</strong>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default IfElseNode;
