// nodes/BranchNode.tsx
import React from "react";
import { Handle, Position } from "reactflow";

const BranchNode = ({ data }: any) => {
  return (
    <div className="branch-node">
      <Handle type="target" position={Position.Top} />
      <div className="branch-label">{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default BranchNode;
