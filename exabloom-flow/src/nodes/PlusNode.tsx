import React from "react";
import "./PlusNode.css";

interface PlusNodeProps {
  data: {
    parentId: string; // ID of the parent node
    nextId: string; // ID of the next node
  };
}

const PlusNode: React.FC<PlusNodeProps> = ({ data }) => {
  const handleClick = () => {
    const event = new CustomEvent("add-node", {
      detail: {
        parentId: data.parentId,
        nextId: data.nextId,
      },
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="plus-node" onClick={handleClick}>
      <button className="plus-button">+</button>
    </div>
  );
};

export default PlusNode;
