# Database Schema Management

This document provides instructions for setting up and managing the PostgreSQL database schema for the USCORE application.

## Schema File

The canonical schema is defined in `schema.sql`. This file contains all the `CREATE TABLE` statements required to build the database structure from scratch.

---

## 1. First-Time Setup

To create the database schema for the first time, you need to have the `psql` command-line tool installed and access to a PostgreSQL database.

Run the following command, replacing the placeholders with your actual database credentials:

```bash
psql -U <your_username> -d <your_database_name> -h <your_host> -f framework/db/schema.sql
```

-   `<your_username>`: Your PostgreSQL user.
-   `<your_database_name>`: The name of the database you want to populate.
-   `<your_host>`: The database host (e.g., `localhost`).

This command will execute the `schema.sql` script and create all the necessary tables, types, and constraints.

---

## 2. Updating the Schema

**IMPORTANT:** Do not modify `schema.sql` and re-run it on an existing database that contains data. This can be destructive and is not a scalable practice.

When you need to change the database schema (e.g., add a column, create a new table, add an index), you should use a **database migration tool**. This is the standard practice in professional software development.

### Why Use a Migration Tool?

-   **Versioning:** Migrations are timestamped or versioned, creating a clear history of schema changes.
-   **Safety:** They are designed to apply changes incrementally and can often be reversed (rolled back).
-   **Consistency:** Ensures that every developer and every environment (development, staging, production) has the exact same schema.
-   **Automation:** Migrations can be easily integrated into deployment pipelines.

### Recommended Tools for a Node.js Backend

-   [**node-pg-migrate**](https://github.com/salsita/node-pg-migrate): A popular and powerful migration tool specifically for Node.js and PostgreSQL.
-   [**Knex.js**](https://knexjs.org/): A SQL query builder that also includes a robust migration system.

### Example Workflow with `node-pg-migrate`

1.  **Install:**
    ```bash
    npm install -D node-pg-migrate
    ```

2.  **Create a new migration file:**
    ```bash
    npm exec pg-migrate create add_user_bio
    ```
    This will generate a new file like `migrations/1625900000000_add_user_bio.js`.

3.  **Edit the migration file:**
    ```javascript
    // migrations/1625900000000_add_user_bio.js
    exports.up = pgm => {
      pgm.addColumns('users', {
        bio: { type: 'text', notNull: false }
      });
    };

    exports.down = pgm => {
      pgm.dropColumns('users', ['bio']);
    };
    ```

4.  **Run the migration:**
    ```bash
    npm exec pg-migrate up
    ```
    This applies all pending migrations to your database. `schema.sql` remains as a reference for the initial state, but all subsequent changes are managed through these versioned migration files.
