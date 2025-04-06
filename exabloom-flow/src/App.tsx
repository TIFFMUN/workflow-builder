// App.tsx
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
import IfElseNode from "./nodes/IfElseNode";

const nodeTypes = {
  actionNode: ActionNode,
  endNode: EndNode,
  startNode: StartNode,
  plusNode: PlusNode,
  ifElseNode: IfElseNode,
};

const App = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [actionNodeName, setActionNodeName] = useState<string>("");
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddNodeOptions, setShowAddNodeOptions] = useState(false);
  const [plusNodePosition, setPlusNodePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);

  const spacing = 50;

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

    const contentNodes = rawNodes.filter((n) => n.type !== "plusNode");

    for (let i = 0; i < contentNodes.length; i++) {
      const node = {
        ...contentNodes[i],
        position: {
          x: (window.innerWidth - 210) / 2,
          y: i * spacing * 2 + 60,
        },
        data: {
          ...contentNodes[i].data,
          label: contentNodes[i].data?.label || "Action Node",
        },
      };
      resultNodes.push(node);

      if (i < contentNodes.length - 1) {
        const next = contentNodes[i + 1];
        const plusId = `plus-${node.id}-${next.id}`;

        resultNodes.push({
          id: plusId,
          type: "plusNode",
          position: { x: node.position.x, y: node.position.y + spacing },
          data: { parentId: node.id, nextId: next.id },
        });

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

  const handleNodeSelection = (nodeType: "actionNode" | "ifElseNode") => {
    if (!currentParentId || !plusNodePosition) return;

    const newNodeId = `${nodeType}-${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type: nodeType,
      position: { x: plusNodePosition.x, y: plusNodePosition.y + spacing * 2 },
      data: {
        label: nodeType === "actionNode" ? "Action Node" : "If/Else Node",
      },
    };

    const filteredNodes = nodes.filter((n) => n.type !== "plusNode");
    const parentIndex = filteredNodes.findIndex(
      (n) => n.id === currentParentId
    );

    if (parentIndex !== -1) {
      filteredNodes.splice(parentIndex + 1, 0, newNode);
      rebuildWithPlusNodes(filteredNodes);
    }

    setShowAddNodeOptions(false);
    setCurrentParentId(null);
    setPlusNodePosition(null);
  };

  const handleNodeClick = (_: any, node: Node) => {
    if (node.type === "actionNode") {
      setEditingNodeId(node.id);
      setActionNodeName(node.data.label);
      setShowModal(true);
    }
  };

  const handleUpdateName = () => {
    if (editingNodeId) {
      const updatedNodes = nodes.map((node) =>
        node.id === editingNodeId
          ? { ...node, data: { ...node.data, label: actionNodeName } }
          : node
      );
      setNodes(updatedNodes);
      setShowModal(false);
      setEditingNodeId(null);
      setActionNodeName("");
    }
  };

  const handleDeleteNode = (id: string) => {
    const updated = nodes.filter((n) => n.id !== id && n.type !== "plusNode");
    rebuildWithPlusNodes(updated);
    setShowModal(false);
  };

  useEffect(() => {
    const handler = (e: any) => {
      const { parentId, nextId } = e.detail;
      const plusNode = nodes.find(
        (n) => n.data?.parentId === parentId && n.data?.nextId === nextId
      );
      if (plusNode) {
        setCurrentParentId(parentId);
        setPlusNodePosition({ x: plusNode.position.x, y: plusNode.position.y });
        setShowAddNodeOptions(true);
      }
    };

    window.addEventListener("plus-node-clicked", handler);
    return () => window.removeEventListener("plus-node-clicked", handler);
  }, [nodes]);

  return (
    <ReactFlowProvider>
      <div style={{ width: "100vw", height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>

        {/* === Modal for Edit/Delete === */}
        {showModal && (
          <div className="side-panel-overlay">
            <div className="side-panel">
              <div className="side-panel-header">
                <h2>Edit Action</h2>
                <p>Modify or remove this action node</p>
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
                  onChange={(e) => setActionNodeName(e.target.value)}
                  placeholder="Enter name"
                />
              </div>
              <div className="side-panel-footer">
                <button
                  className="delete"
                  onClick={() => handleDeleteNode(editingNodeId!)}
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

        {/* === Modal for choosing Action or If/Else === */}
        {showAddNodeOptions && (
          <div className="side-panel-overlay">
            <div className="side-panel">
              <div className="side-panel-header">
                <h2>Add Node</h2>
                <p>Select the type of node to insert</p>
                <button
                  className="close-btn"
                  onClick={() => setShowAddNodeOptions(false)}
                >
                  ×
                </button>
              </div>

              <div className="side-panel-body">
                <div className="add-node-button-group">
                  <button onClick={() => handleNodeSelection("actionNode")}>
                    Add Action Node
                  </button>
                  <button onClick={() => handleNodeSelection("ifElseNode")}>
                    Add If/Else Node
                  </button>
                </div>
              </div>

              <div className="side-panel-footer">
                <div className="right-buttons">
                  <button
                    className="cancel"
                    onClick={() => setShowAddNodeOptions(false)}
                  >
                    Cancel
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
