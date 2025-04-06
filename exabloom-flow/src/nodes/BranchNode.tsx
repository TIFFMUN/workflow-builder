// nodes/BranchNode.tsx
import React from "react";
import { Handle, Position } from "reactflow";
import "./BranchNode.css";

const BranchNode = ({ data }: any) => (
  <div className="branch-node">
    <Handle type="target" position={Position.Top} />
    <div className="label">{data.label}</div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

export default BranchNode;
