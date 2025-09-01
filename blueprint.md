
# Project Overview

This is a Next.js project that uses Prisma for database access with PostgreSQL. The application allows users to learn different subjects (Contenidos) and their specific topics (Temas).

# Project Features

* **Framework:** Next.js
* **Database:** PostgreSQL
* **ORM:** Prisma

## Schema

* **User Model:**
    * `id`: Int (autoincrement, primary key)
    * `name`: String (optional)
    * `email`: String (unique)
    * `password`: String
    * `createdAt`: DateTime (defaults to now)
    * `updatedAt`: DateTime (updates on modification)

* **Contenido Model:**
    * `id`: Int (autoincrement, primary key)
    * `name`: String
    * `temas`: Relation to `Tema` model (one-to-many)

* **Tema Model:**
    * `id`: Int (autoincrement, primary key)
    * `name`: String
    * `contenido`: Relation to `Contenido` model (many-to-one)
    * `contenidoId`: Int

# Current Plan

* **Goal:** Create the `Contenido` and `Tema` models.
* **Steps:**
    1. Define the `Contenido` and `Tema` models in `prisma/schema.prisma`.
    2. Run `prisma migrate dev` to create and apply the migration.
