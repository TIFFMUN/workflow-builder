# Workflow Builder

## Overview

This project is a workflow builder using **React** and **React Flow**. Users can create, edit, and delete nodes to build a visual workflow. The workflow starts with a **Start Node** and an **End Node**, and **Action Nodes** can be added in between. Nodes are automatically connected by **PlusNodes**.

### Features

- Add, edit, and delete nodes
- Dynamically updates the layout when nodes are added or deleted

### Key Functions

**rebuildWithPlusNodes**: rebuilds the entire node and edge layout every time a change occurs (such as adding or deleting a node).
**handleAdd**: dynamically adds a new Action node between two existing nodes when the plus button is clicked.
**openModal**: opens the modal to edit the node.
**handleChangeName**: updates the node’s name as the user types in the modal.
**handleUpdateName**: saves the changes to the node name and re-renders the layout.
**handleDeleteNode**: deletes a node and recalculates the layout, ensuring no dangling edges and maintaining the workflow structure.

### Assumptions

- The layout recalculates only on initial load or when nodes are added, assuming that the window size remains fairly consistent.
- For a very large number of nodes, more performance optimizations like virtualization may be needed, but this was not required for this assignment.

### Challenges Faced

- Ensuring that nodes don’t overlap when added dynamically.
- Maintaining node connections after node deletion.

### Setup Instructions

```bash
git clone https://github.com/TIFFMUN/workflow-builder.git
cd workflow-builder
npm install
npm start
```

**View the project** at `http://localhost:3000`.

## Technologies Used

- **React** (for building the UI)
- **React Flow** (for managing and visualizing nodes and edges)
- **JavaScript**/ **TypeScript** (for frontend logic)

### Video Link

https://www.loom.com/share/abf7b6e2fef5425db5df346b612701a8?sid=8686de4c-580d-43e4-bbcb-1a6f9bd6226c
