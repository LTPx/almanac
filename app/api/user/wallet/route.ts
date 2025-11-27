import { NextRequest, NextResponse } from "next/server";
import { createWalletForUser } from "@/lib/wallet-service";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const { user } = session;
    const userId = session.user.id;

    if (user.walletAddress) {
      return NextResponse.json(
        {
          error: "Ya tienes una wallet creada"
        },
        { status: 409 }
      );
    }

    const result = await createWalletForUser(userId);

    return NextResponse.json({
      success: true,
      walletAddress: result.address,
      mnemonic: result.mnemonic,
      message: "Wallet creada exitosamente"
    });
  } catch (error: any) {
    console.error("❌ Wallet creation error:", error);
    return NextResponse.json(
      { error: "Error al crear wallet", details: error.message },
      { status: 500 }
    );
  }
}
