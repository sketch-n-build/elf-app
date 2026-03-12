import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {

    try {
        return NextResponse.json({ message: "Login successful" });
    } catch (error) {
        return NextResponse.json({ message: "Login failed" }, { status: 400 });
    }
}
  