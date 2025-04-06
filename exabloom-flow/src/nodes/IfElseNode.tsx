// import React, { useState } from "react";
// import { Handle, Position } from "reactflow";
// import "./IfElseNode.css";

// interface IfElseNodeProps {
//   data: {
//     label: string;
//   };
// }

// const IfElseNode: React.FC<IfElseNodeProps> = ({ data }) => {
//   const [branch1, setBranch1] = useState("Branch #1");
//   const [branch2, setBranch2] = useState("Branch #2");
//   const [elseLabel, setElseLabel] = useState("Else");

//   return (
//     <div className="ifelse-node">
//       <Handle type="source" position={Position.Top} />
//       <div className="ifelse-node-content">
//         <strong>{data.label}</strong>
//         <div>
//           <label>Branch 1:</label>
//           <input
//             type="text"
//             value={branch1}
//             onChange={(e) => setBranch1(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>Branch 2:</label>
//           <input
//             type="text"
//             value={branch2}
//             onChange={(e) => setBranch2(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>Else:</label>
//           <input
//             type="text"
//             value={elseLabel}
//             onChange={(e) => setElseLabel(e.target.value)}
//           />
//         </div>
//       </div>
//       <Handle type="target" position={Position.Bottom} />
//     </div>
//   );
// };

// export default IfElseNode;

import React, { useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";

const IfElseNode = ({ id, data, selected }: NodeProps) => {
  const [ifLabel, setIfLabel] = useState(data?.label?.if || "If Condition");
  const [elseLabel, setElseLabel] = useState(
    data?.label?.else || "Else Condition"
  );

  const handleIfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIfLabel(e.target.value);
    data?.onLabelChange?.(id, "if", e.target.value);
  };

  const handleElseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setElseLabel(e.target.value);
    data?.onLabelChange?.(id, "else", e.target.value);
  };

  return (
    <div className={`ifelse-node ${selected ? "selected" : ""}`}>
      <div className="node-header">
        <h3>If/Else Node</h3>
      </div>
      <div className="node-body">
        <label>If Condition</label>
        <input type="text" value={ifLabel} onChange={handleIfChange} />
        <label>Else Condition</label>
        <input type="text" value={elseLabel} onChange={handleElseChange} />
      </div>

      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  );
};

export default IfElseNode;
