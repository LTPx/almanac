# Project Blueprint

## Overview

This is a Next.js application with Prisma for database management.

## Features

### User Model

*   `id`: Int (autoincrement, primary key)
*   `name`: String (optional)
*   `email`: String (unique)
*   `password`: String
*   `createdAt`: DateTime (default: now())
*   `updatedAt`: DateTime (updated at)
*   `role`: Role (enum: `USER`, `ADMIN`, default: `USER`)

### Content Model

*   `id`: Int (autoincrement, primary key)
*   `name`: String
*   `temas`: Relation to Tema model

### Tema Model

*   `id`: Int (autoincrement, primary key)
*   `name`: String
*   `contenido`: Relation to Contenido model

## Current Task: Add Role to User

*   [x] Add `Role` enum to `prisma/schema.prisma` with `USER` and `ADMIN` values.
*   [x] Add `role` field to `User` model in `prisma/schema.prisma`.
*   [x] Run database migration to apply the changes.
*   [x] Document the changes in `blueprint.md`.
