import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {

    try {
        return NextResponse.json({ message: "Registration successful" });
    } catch (error) {
        return NextResponse.json({ message: "Registration failed" }, { status: 400 });
    }
}