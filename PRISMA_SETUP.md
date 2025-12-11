# Prisma Setup & Migration Guide

## Overview

This project uses **Prisma** as the ORM (Object-Relational Mapping) tool for database management and migrations.

## Prerequisites

1. PostgreSQL database running
2. `.env` file configured with `DATABASE_URL`

## Initial Setup

### 1. Install Dependencies

```bash
bun install
```

This will install:
- `@prisma/client` - Prisma Client for database queries
- `prisma` - Prisma CLI for migrations and schema management

### 2. Generate Prisma Client

After installing dependencies, generate the Prisma Client:

```bash
bun run db:generate
```

This reads `prisma/schema.prisma` and generates TypeScript types and the Prisma Client.

### 3. Run Initial Migration

Create and apply the initial migration:

```bash
bun run db:migrate
```

This will:
- Create a new migration file in `prisma/migrations/`
- Apply the migration to your database
- Generate Prisma Client automatically

**Note:** If you already have an existing database with the schema, you can use:

```bash
bun run db:push
```

This will push the schema to the database without creating migration files (useful for prototyping).

## Available Commands

### Database Commands

```bash
# Generate Prisma Client (after schema changes)
bun run db:generate

# Create and apply a new migration
bun run db:migrate

# Push schema changes to database (no migration files)
bun run db:push

# Deploy migrations (for production)
bun run db:migrate:deploy

# Open Prisma Studio (database GUI)
bun run db:studio

# Run seed script
bun run db:seed
```

## Workflow

### Making Schema Changes

1. **Edit `prisma/schema.prisma`** - Update your schema
2. **Generate Prisma Client:**
   ```bash
   bun run db:generate
   ```
3. **Create Migration:**
   ```bash
   bun run db:migrate
   ```
   - Prisma will prompt you to name the migration
   - Migration files are created in `prisma/migrations/`
4. **Migration is automatically applied** to your database

### Example: Adding a New Field

1. Edit `prisma/schema.prisma`:
   ```prisma
   model User {
     // ... existing fields
     phoneNumber String? @map("phone_number") @db.VarChar(20)
   }
   ```

2. Generate and migrate:
   ```bash
   bun run db:generate
   bun run db:migrate
   ```

3. Use in code:
   ```ts
   const user = await prisma.user.create({
     data: {
       name: "John",
       email: "john@example.com",
       phoneNumber: "+1234567890",
     },
   });
   ```

## Schema File Structure

The Prisma schema (`prisma/schema.prisma`) defines:

- **Models** - Database tables
- **Enums** - Database enums
- **Relations** - Foreign key relationships
- **Indexes** - Database indexes
- **Generators** - Code generation settings
- **Datasource** - Database connection

## Using Prisma Client

### Import Prisma Client

```ts
import { prisma } from "@/infrastructure/database/PrismaClient";
```

### Example Queries

```ts
// Create
const user = await prisma.user.create({
  data: {
    googleId: "123",
    name: "John Doe",
    email: "john@example.com",
  },
});

// Read
const user = await prisma.user.findUnique({
  where: { id: "uuid-here" },
});

// Update
const user = await prisma.user.update({
  where: { id: "uuid-here" },
  data: { name: "Jane Doe" },
});

// Delete
await prisma.user.delete({
  where: { id: "uuid-here" },
});

// Relations
const userWithSubscriptions = await prisma.user.findUnique({
  where: { id: "uuid-here" },
  include: {
    subscriptions: true,
  },
});
```

## Migrations

### Migration Files

Migrations are stored in `prisma/migrations/` directory. Each migration contains:
- SQL statements to modify the database
- Migration metadata

### Creating Migrations

```bash
bun run db:migrate
```

Prisma will:
1. Detect schema changes
2. Generate SQL migration
3. Apply to database
4. Update migration history

### Resetting Database (Development Only)

⚠️ **Warning:** This will delete all data!

```bash
bunx prisma migrate reset
```

### Production Deployments

For production, use:

```bash
bun run db:migrate:deploy
```

This applies pending migrations without prompting.

## Prisma Studio

Prisma Studio is a visual database browser:

```bash
bun run db:studio
```

Opens at `http://localhost:5555` where you can:
- View all tables
- Edit data
- Run queries
- Explore relationships

## Troubleshooting

### "Prisma Client not generated"

Run:
```bash
bun run db:generate
```

### "Migration failed"

1. Check database connection in `.env`
2. Verify schema syntax in `prisma/schema.prisma`
3. Check migration files for errors

### "Schema drift detected"

This means your database doesn't match your schema. Options:

1. **Reset and migrate** (development only):
   ```bash
   bunx prisma migrate reset
   ```

2. **Create a migration** to sync:
   ```bash
   bun run db:migrate
   ```

3. **Push schema** (if you want to skip migrations):
   ```bash
   bun run db:push
   ```

### Connection Issues

1. Verify `DATABASE_URL` in `.env`
2. Check PostgreSQL is running
3. Test connection:
   ```bash
   psql $DATABASE_URL
   ```

## Best Practices

1. **Always generate Prisma Client** after schema changes
2. **Create migrations** for production deployments
3. **Use `db:push`** only for prototyping
4. **Review migration SQL** before applying
5. **Backup database** before migrations in production
6. **Use transactions** for complex operations

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Migrate Guide](https://www.prisma.io/docs/guides/migrate)

