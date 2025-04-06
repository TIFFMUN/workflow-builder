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
import BranchNode from "./nodes/BranchNode";

const nodeTypes = {
  actionNode: ActionNode,
  endNode: EndNode,
  startNode: StartNode,
  plusNode: PlusNode,
  ifElseNode: IfElseNode,
  BranchNode: BranchNode,
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
    const filteredNodes = nodes.filter((n) => n.type !== "plusNode");
    const parentIndex = filteredNodes.findIndex(
      (n) => n.id === currentParentId
    );
    if (parentIndex === -1) return;

    // === CASE 1: ACTION NODE ===
    if (nodeType === "actionNode") {
      const newActionNode: Node = {
        id: newNodeId,
        type: "actionNode",
        position: {
          x: plusNodePosition.x,
          y: plusNodePosition.y + spacing * 2,
        },
        data: { label: "Action Node" },
      };

      filteredNodes.splice(parentIndex + 1, 0, newActionNode);
      rebuildWithPlusNodes(filteredNodes);
    }

    // === CASE 2: IF / ELSE NODE + 3 BRANCHES ===
    else if (nodeType === "ifElseNode") {
      const ifElseNode: Node = {
        id: newNodeId,
        type: "ifElseNode",
        position: {
          x: plusNodePosition.x,
          y: plusNodePosition.y + spacing * 2,
        },
        data: { label: "If / Else" },
      };

      const branchYOffset = spacing * 5;
      const branchXOffset = 200;
      const endYOffset = spacing * 3;

      const baseX = plusNodePosition.x;
      const baseY = plusNodePosition.y + spacing * 2;

      // Branches
      const branches: Node[] = [
        {
          id: `${newNodeId}-branch1`,
          type: "branchNode",
          position: { x: baseX - branchXOffset, y: baseY + branchYOffset },
          data: { label: "Branch #1" },
        },
        {
          id: `${newNodeId}-branch2`,
          type: "branchNode",
          position: { x: baseX, y: baseY + branchYOffset },
          data: { label: "Branch #2" },
        },
        {
          id: `${newNodeId}-else`,
          type: "branchNode",
          position: { x: baseX + branchXOffset, y: baseY + branchYOffset },
          data: { label: "Else" },
        },
      ];

      // End nodes (1 for each branch)
      const ends: Node[] = branches.map((branch, idx) => ({
        id: `${branch.id}-end`,
        type: "endNode",
        position: {
          x: branch.position.x,
          y: branch.position.y + endYOffset,
        },
        data: { label: "End" },
      }));

      // Edges from IfElse to each branch
      const edgesFromIfElse: Edge[] = branches.map((branch) => ({
        id: `e-${newNodeId}-${branch.id}`,
        source: newNodeId,
        target: branch.id,
        type: "smoothstep",
      }));

      // Edges from branches to end
      const edgesToEnd: Edge[] = branches.map((branch) => ({
        id: `e-${branch.id}-end`,
        source: branch.id,
        target: `${branch.id}-end`,
        type: "straight",
      }));

      // Edge from parent to IfElse
      const edgeFromParent: Edge = {
        id: `e-${currentParentId}-${newNodeId}`,
        source: currentParentId,
        target: newNodeId,
        type: "straight",
      };

      // Final node + edge list
      const newNodes = filteredNodes.filter((node) => node.type !== "endNode");
      newNodes.splice(parentIndex + 1, 0, ifElseNode, ...branches, ...ends);

      setNodes(newNodes);
      setEdges((prev) => [
        ...prev,
        edgeFromParent,
        ...edgesFromIfElse,
        ...edgesToEnd,
      ]);
    }

    // === RESET STATE ===
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
