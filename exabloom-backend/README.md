# Exabloom Backend Test

## Objective

The goal of this project is to build an efficient backend system capable of managing a large-scale contact and messaging database using **PostgreSQL** and **Express**. The system should be able to retrieve the 50 most recent conversations, implement pagination, and support a search feature. The backend is designed for performance optimization and scalability.

### Features

- Retrieves the 50 most recent conversations from a database.
- Pagination support for fetching conversations in sets of 50.
- Search functionality for filtering conversations by message content, contact name, or phone number.

### Assumptions Made

- Data Integrity: Assumed that data integrity is maintained in the database. For example, foreign keys and constraints are properly set up, ensuring that relationships between tables (e.g., contacts and messages) are respected.

### Key Design Decisions:

- PostgreSQL Integration: Used the pg library to connect the Node.js backend to PostgreSQL, allowing for seamless data interaction and executing SQL queries.
- Environment Configuration: Database connection credentials are stored in a .env file, keeping sensitive information out of the codebase and allowing for easier configuration.
- Seed Data: Implemented the seed.js script to insert initial test data into the database, ensuring that the database is populated before running queries or starting the server.
- SQL Query Execution: Queries are designed to be efficient, using the SELECT and JOIN operations to fetch data. Indexing on frequently queried fields (e.g., contact_id, created_at) was implemented to enhance performance.
- Server Setup: The Express server listens after confirming a successful database connection, ensuring that the app doesn't start without proper database access.

### Setup Instructions

1. Set Up VS Code

```bash
git clone https://github.com/your-username/exabloom-backend.git
cd exabloom-backend
npm install
```

2. Create a PostgreSQL database for this project (e.g., exabloom).
3. In the root folder, create a .env file if not already present and set your PostgreSQL connection details:

```bash
DATABASE_URL=postgresql://postgres:your_postgresql_password@localhost:5432/exabloom
PORT=3001
```

4. Run the create_table.sql script to set up the necessary tables in the database.
5. Run the seed.js script to insert dummy data (contacts and messages) into your PostgreSQL database:

```bash
node seed.js
node index.js
```

6. Now, you can run the SQL queries to retrieve conversations or perform other operations. The queries are located in the sql_queries folder (query1.sql, query2.sql, query3.sql).

### Technologies Used

- **PostgreSQL** (for the database)
- **SQL** (for querying the database)
- **Node.js** with **Express** (for the backend API)

### Video Link

https://www.loom.com/share/abf7b6e2fef5425db5df346b612701a8?sid=8686de4c-580d-43e4-bbcb-1a6f9bd6226c
