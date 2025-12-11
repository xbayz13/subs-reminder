# Prisma Migrations

This directory contains Prisma migration files. Each migration represents a change to your database schema.

## Migration Files

Migration files are automatically generated when you run:

```bash
bun run db:migrate
```

Each migration includes:
- SQL statements to modify the database
- Migration metadata and history

## Important Notes

- **Don't edit migration files manually** - They are auto-generated
- **Don't delete migration files** - They are needed for migration history
- **Commit migrations to git** - They should be version controlled

## Migration Workflow

1. Edit `prisma/schema.prisma`
2. Run `bun run db:migrate`
3. Migration files are created here
4. Review the generated SQL
5. Commit to git

