import React, { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import "./App.css";

import ActionNode from "./nodes/ActionNode";
import EndNode from "./nodes/EndNode";
import StartNode from "./nodes/StartNode";
import PlusNode from "./nodes/PlusNode";

const nodeTypes = {
  actionNode: ActionNode,
  endNode: EndNode,
  startNode: StartNode,
  plusNode: PlusNode,
};

const App = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [actionNodeName, setActionNodeName] = useState<string>("");
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const spacing = 50;

  // Initialize Start and End node
  useEffect(() => {
    const initialNodes = [
      {
        id: "start",
        type: "startNode",
        position: { x: (window.innerWidth - 140) / 2, y: 20 },
        data: { label: "Start" },
      },
      {
        id: "end",
        type: "endNode",
        position: { x: window.innerWidth / 2, y: 100 },
        data: { label: "End" },
      },
    ];
    rebuildWithPlusNodes(initialNodes);
  }, []);

  const rebuildWithPlusNodes = (rawNodes: Node[]) => {
    const resultNodes: Node[] = [];
    const resultEdges: Edge[] = [];

    const contentNodes = [...rawNodes.filter((n) => n.type !== "plusNode")];

    for (let i = 0; i < contentNodes.length; i++) {
      const node = {
        ...contentNodes[i],
        position: {
          x: (window.innerWidth - 210) / 2,
          y: i * spacing * 2 + 60,
        },
        data: {
          label: contentNodes[i].data?.label || "Action Node",
        },
      };
      resultNodes.push(node);

      if (i < contentNodes.length - 1) {
        const next = contentNodes[i + 1];
        const plusId = `plus-${node.id}-${next.id}`;

        const plusNode: Node = {
          id: plusId,
          type: "plusNode",
          position: {
            x: node.position.x,
            y: node.position.y + spacing,
          },
          data: { parentId: node.id, nextId: next.id },
        };

        resultNodes.push(plusNode);
        resultEdges.push({
          id: `e-${node.id}-${next.id}`,
          source: node.id,
          target: next.id,
          type: "straight",
        });
      }
    }

    setNodes(resultNodes);
    setEdges(resultEdges);
  };

  // Handle Change in Action Node Name
  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActionNodeName(e.target.value);
  };

  const handleUpdateName = () => {
    if (editingNodeId) {
      const updatedNodes = nodes.map((node) =>
        node.id === editingNodeId
          ? { ...node, data: { label: actionNodeName } }
          : node
      );
      setNodes(updatedNodes);
      setShowModal(false);
      setActionNodeName(""); // Clear input field
      setEditingNodeId(null);
    }
  };

  // Handle Node Deletion
  const handleDeleteNode = (nodeId: string) => {
    const filtered = nodes.filter(
      (node) => node.id !== nodeId && node.type !== "plusNode"
    );
    rebuildWithPlusNodes(filtered);
    setShowModal(false);
  };

  // Open modal on node click
  const openModal = (nodeId: string) => {
    setEditingNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setActionNodeName(node.data.label);
    }
    setShowModal(true);
  };

  const handleNodeClick = (event: any, node: Node) => {
    if (node.type === "actionNode") {
      openModal(node.id);
    }
  };

  useEffect(() => {
    const handleAdd = (e: any) => {
      const { parentId, nextId } = e.detail;
      const currentNodes = nodes.filter((n) => n.type !== "plusNode");

      const parentIndex = currentNodes.findIndex((n) => n.id === parentId);
      const nextIndex = currentNodes.findIndex((n) => n.id === nextId);
      if (parentIndex === -1 || nextIndex === -1) return;

      const newActionId = `action-${Date.now()}`;
      const newAction: Node = {
        id: newActionId,
        type: "actionNode",
        position: { x: 250, y: 0 },
        data: { label: "Action Node" },
      };

      const updated = [...currentNodes];
      updated.splice(parentIndex + 1, 0, newAction);

      rebuildWithPlusNodes(updated);
    };

    window.addEventListener("add-node", handleAdd);
    return () => window.removeEventListener("add-node", handleAdd);
  }, [nodes]);

  return (
    <ReactFlowProvider>
      <div style={{ width: "100vw", height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: 20, y: 0, zoom: 1 }}
          onNodeClick={handleNodeClick} // Handle click on Action Node to open modal
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>

        {/* Modal for editing Action Node */}
        {showModal && (
          <div className="side-panel-overlay">
            <div className="side-panel">
              <div className="side-panel-header">
                <h2>Action</h2>
                <p>Edit the action node</p>
                <button
                  className="close-btn"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="side-panel-body">
                <label>Action Name</label>
                <input
                  type="text"
                  value={actionNodeName}
                  onChange={handleChangeName}
                  placeholder="Enter action name"
                />
                {/* Optional future section:
        <div className="add-field">+ Add field</div>
        */}
              </div>

              <div className="side-panel-footer">
                <button
                  className="delete"
                  onClick={() => handleDeleteNode(editingNodeId || "")}
                >
                  Delete
                </button>
                <div className="right-buttons">
                  <button
                    className="cancel"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button className="save" onClick={handleUpdateName}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
};

export default App;
