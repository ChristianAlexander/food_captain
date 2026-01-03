# Food Captain

A demonstration of local-first database synchronization using **TanStack DB** and **Phoenix Sync**. Companion to a two-part YouTube video series on building local-first web applications in React.

## Getting Started

This project supports two development modes:

### Frontend-Only (JavaScript Developers)

Learn TanStack DB without setting up a backend. Uses localStorage for data persistence.

1. **Navigate to the assets directory:**
   ```bash
   cd assets
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open the application:**
   - [`localhost:3000`](http://localhost:3000)

This mode runs a standalone Vite development server with all frontend features including TanStack DB, localStorage persistence, and the UI.

### Full-Stack (Elixir Developers)

Full implementation with Phoenix Sync and PostgreSQL synchronization.

#### Prerequisites

You need a PostgreSQL database with Write-Ahead Logging (WAL) enabled for Phoenix Sync to work.

**Quick Start with Docker:**
```bash
docker compose up -d
```

This will start a PostgreSQL instance configured with WAL enabled.

**Manual PostgreSQL Setup:**
If you're using an existing PostgreSQL instance, consult [its documentation](https://www.postgresql.org/docs/current/logical-replication-config.html)

#### Running the Server

1. Install JavaScript dependencies: `npm i --prefix assets`
2. Run `mix setup` to install and setup dependencies
3. Start the server: `iex -S mix phx.server`
4. Open [`localhost:4000`](http://localhost:4000)

## References

- **[TanStack DB](https://tanstack.com/db/latest)** - Local-first database for web applications
- **[Phoenix Sync](https://hexdocs.pm/phoenix_sync)** - Real-time database synchronization for Phoenix
- **[ElectricSQL](https://electric-sql.com/)** - Database synchronization for any Postgres-backed application
