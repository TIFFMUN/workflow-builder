import React from "react";
import { Handle, NodeProps, Position } from "reactflow";
import "./IfElseNode.css";

const IfElseNode = ({ selected }: NodeProps) => {
  return (
    <div className={`ifelse-node ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Top} id="top" />
      <div className="node-header">
        <h3>If / Else</h3>
      </div>

      <div className="branch-handles">
        <div className="branch-label">
          <span>Branch #1</span>
          <Handle type="source" position={Position.Bottom} id="if" />
        </div>
        <div className="branch-label">
          <span>Branch #2</span>
          <Handle type="source" position={Position.Bottom} id="elseif" />
        </div>
        <div className="branch-label">
          <span>Else</span>
          <Handle type="source" position={Position.Bottom} id="else" />
        </div>
      </div>
    </div>
  );
};

export default IfElseNode;
