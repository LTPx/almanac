/**
 * Utilidades para verificar permisos de administrador
 */

import { Session } from "better-auth/types";
import { NextResponse } from "next/server";

/**
 * Verifica si un usuario es administrador
 */
export function isUserAdmin(userId: string): boolean {
  const adminUsers = process.env.ADMIN_USERS_IDS || "";
  const users = adminUsers.split(", ").map((id) => id.trim());
  return users.includes(userId);
}

/**
 * Verifica si la sesión pertenece a un administrador
 */
export function isSessionAdmin(session: Session | null): boolean {
  if (!session?.user?.id) {
    return false;
  }
  return isUserAdmin(session.user.id);
}

/**
 * Verifica si la sesión es de un administrador y retorna respuesta de error si no lo es
 * Uso en API routes:
 *
 * const adminCheck = verifyAdminSession(session);
 * if (adminCheck) return adminCheck;
 */
export function verifyAdminSession(session: Session | null): NextResponse | null {
  if (!session) {
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401 }
    );
  }

  if (!isSessionAdmin(session)) {
    return NextResponse.json(
      { error: "No tienes permisos de administrador" },
      { status: 403 }
    );
  }

  return null;
}
