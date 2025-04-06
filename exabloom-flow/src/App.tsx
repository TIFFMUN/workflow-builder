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
    const initialNodes: Node[] = [
      {
        id: "start",
        type: "startNode",
        position: { x: (window.innerWidth - 140) / 2, y: 20 },
        data: { label: "Start" },
      },
    ];
    rebuildWithPlusNodes(initialNodes, []);
  }, []);

  const removeChildEndAndPlusNodes = (
    nodes: Node[],
    edges: Edge[],
    parentId: string
  ) => {
    // Find End nodes directly connected to parent
    const connectedEndEdges = edges.filter(
      (e) => e.source === parentId && e.target.endsWith("-end")
    );
    const connectedEndIds = connectedEndEdges.map((e) => e.target);

    // Remove:
    // 1. End nodes that are children of this node
    // 2. PlusNodes associated with those connections
    const cleanedNodes = nodes.filter(
      (n) =>
        !connectedEndIds.includes(n.id) &&
        !(n.type === "plusNode" && n.data?.parentId === parentId)
    );

    // Remove:
    // 1. Edges to those End nodes
    // 2. Edges to or from PlusNodes between parent and End
    const cleanedEdges = edges.filter(
      (e) =>
        e.source !== parentId ||
        (!connectedEndIds.includes(e.target) &&
          !e.id.includes(`plus-${parentId}`))
    );

    return { cleanedNodes, cleanedEdges };
  };

  const rebuildWithPlusNodes = (rawNodes: Node[], rawEdges: Edge[] = []) => {
    const resultNodes: Node[] = [];
    const resultEdges: Edge[] = [];

    const contentNodes = rawNodes.filter(
      (n) => n.type !== "plusNode" && n.type !== "endNode"
    );

    const getNextTarget = (sourceId: string) =>
      rawEdges.find((e) => e.source === sourceId)?.target;

    const addPlusBetween = (
      source: string,
      target: string,
      sourcePos: any,
      targetPos: any
    ) => {
      const plusId = `plus-${source}-${target}`;
      const plusNode: Node = {
        id: plusId,
        type: "plusNode",
        position: {
          x: (sourcePos.x + targetPos.x) / 2,
          y: (sourcePos.y + targetPos.y) / 2,
        },
        data: { parentId: source, nextId: target },
      };
      resultNodes.push(plusNode);
      resultEdges.push(
        {
          id: `e-${source}-${plusId}`,
          source,
          target: plusId,
          type: "straight",
        },
        {
          id: `e-${plusId}-${target}`,
          source: plusId,
          target,
          type: "straight",
        },
        {
          id: `dashed-${source}-${target}`,
          source,
          target,
          type: "straight",
          style: {
            stroke: "#999",
            strokeDasharray: "5,5",
          },
        }
      );
    };

    for (const node of contentNodes) {
      resultNodes.push(node);
    }

    for (const edge of rawEdges) {
      const sourceNode = contentNodes.find((n) => n.id === edge.source);
      const targetNode = contentNodes.find((n) => n.id === edge.target);

      const isIfElseToBranch =
        sourceNode?.type === "ifElseNode" && targetNode?.type === "branchNode";

      if (isIfElseToBranch) {
        resultEdges.push(edge); // Keep IfElse → Branch edges
        continue;
      }

      // if (
      //   sourceNode &&
      //   targetNode &&
      //   !(
      //     sourceNode.type === "actionNode" &&
      //     targetNode.id.startsWith("end-") &&
      //     !targetNode.id.includes(sourceNode.id)
      //   )
      // )
      if (sourceNode && targetNode) {
        addPlusBetween(
          edge.source,
          edge.target,
          sourceNode.position,
          targetNode.position
        );
      }
    }

    const branchNodes = contentNodes.filter((n) => n.type === "branchNode");
    for (const branch of branchNodes) {
      const endId = `${branch.id}-end`;
      const endNode: Node = {
        id: endId,
        type: "endNode",
        position: { x: branch.position.x, y: branch.position.y + spacing * 2 },
        data: { label: "End" },
      };
      resultNodes.push(endNode);
      addPlusBetween(branch.id, endId, branch.position, endNode.position);
    }

    const lastLinear = [...contentNodes]
      .reverse()
      .find(
        (n) =>
          ["startNode", "actionNode"].includes(n.type || "") &&
          !rawEdges.some((e) => e.source === n.id)
      );
    if (lastLinear && lastLinear.type !== "ifElseNode") {
      const endId = `end-${lastLinear.id}`;
      const endNode: Node = {
        id: endId,
        type: "endNode",
        position: {
          x: lastLinear.position.x,
          y: lastLinear.position.y + spacing * 2,
        },
        data: { label: "End" },
      };
      resultNodes.push(endNode);
      addPlusBetween(
        lastLinear.id,
        endId,
        lastLinear.position,
        endNode.position
      );
    }

    setNodes(resultNodes);
    setEdges(resultEdges);
  };

  const handleNodeSelection = (nodeType: "actionNode" | "ifElseNode") => {
    if (!currentParentId || !plusNodePosition) return;

    const newNodeId = `${nodeType}-${Date.now()}`;
    const filteredNodes = nodes.filter(
      (n) => n.type !== "plusNode" && n.type !== "endNode"
    );
    const parentIndex = filteredNodes.findIndex(
      (n) => n.id === currentParentId
    );
    if (parentIndex === -1) return;

    //   rebuildWithPlusNodes([...filteredNodes, newActionNode], updatedEdges);
    if (nodeType === "actionNode") {
      const branchEndId = `${currentParentId}-end`;

      // Detect if current parent connects to any EndNode
      const { cleanedNodes: updatedNodes, cleanedEdges: updatedEdges } =
        removeChildEndAndPlusNodes(nodes, edges, currentParentId);

      const newActionNode: Node = {
        id: newNodeId,
        type: "actionNode",
        position: {
          x: plusNodePosition.x,
          y: plusNodePosition.y + spacing * 2,
        },
        data: { label: "Action Node" },
      };

      const newEndId = `end-${newNodeId}`;
      const newEndNode: Node = {
        id: newEndId,
        type: "endNode",
        position: {
          x: newActionNode.position.x,
          y: newActionNode.position.y + spacing * 2,
        },
        data: { label: "End" },
      };

      const edgeToAction: Edge = {
        id: `e-${currentParentId}-${newNodeId}`,
        source: currentParentId,
        target: newNodeId,
        type: "straight",
      };

      const edgeToEnd: Edge = {
        id: `e-${newNodeId}-${newEndId}`,
        source: newNodeId,
        target: newEndId,
        type: "straight",
      };

      rebuildWithPlusNodes(
        [...updatedNodes, newActionNode, newEndNode],
        [...updatedEdges, edgeToAction, edgeToEnd]
      );
    } else if (nodeType === "ifElseNode") {
      const branchEndId = `${currentParentId}-end`;

      // Remove any lingering End node and its edges from currentParentId
      const connectedEndEdges = edges.filter(
        (e) => e.source === currentParentId && e.target.endsWith("-end")
      );
      const connectedEndIds = connectedEndEdges.map((e) => e.target);

      const updatedEdges = edges.filter(
        (e) =>
          e.source !== currentParentId ||
          (!connectedEndIds.includes(e.target) &&
            !e.id.includes(`plus-${currentParentId}`))
      );

      const updatedNodes = filteredNodes.filter(
        (n) =>
          !connectedEndIds.includes(n.id) &&
          !(n.type === "plusNode" && n.data?.parentId === currentParentId)
      );

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

      const ends: Node[] = branches.map((branch) => ({
        id: `${branch.id}-end`,
        type: "endNode",
        position: {
          x: branch.position.x,
          y: branch.position.y + endYOffset,
        },
        data: { label: "End" },
      }));

      const edgesFromIfElse: Edge[] = branches.map((branch) => ({
        id: `e-${newNodeId}-${branch.id}`,
        source: newNodeId,
        target: branch.id,
        type: "smoothstep",
      }));

      const edgesToEnd: Edge[] = branches.map((branch) => ({
        id: `e-${branch.id}-end`,
        source: branch.id,
        target: `${branch.id}-end`,
        type: "straight",
      }));

      const edgeFromParent: Edge = {
        id: `e-${currentParentId}-${newNodeId}`,
        source: currentParentId,
        target: newNodeId,
        type: "straight",
      };

      const newNodes = updatedNodes.filter((node) => node.type !== "endNode");
      newNodes.splice(parentIndex + 1, 0, ifElseNode, ...branches, ...ends);

      rebuildWithPlusNodes(newNodes, [
        ...updatedEdges,
        edgeFromParent,
        ...edgesFromIfElse,
        ...edgesToEnd,
      ]);
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
      rebuildWithPlusNodes(updatedNodes, edges);
      setShowModal(false);
      setEditingNodeId(null);
      setActionNodeName("");
    }
  };

  const handleDeleteNode = (id: string) => {
    const updated = nodes.filter((n) => n.id !== id && n.type !== "plusNode");
    rebuildWithPlusNodes(
      updated,
      edges.filter((e) => e.source !== id && e.target !== id)
    );
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
