import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt';



export const GET = async (request: NextRequest) => {
 try {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('userId');
  const token = searchParams.get('token');

  // Validate presence
  if (!id || !token) {
    return NextResponse.json(
      { 
       success: false,
       error: "Couldn't find user or token or email"
      },
      { status: 400 }
    );
  }

  // Verify the JWT (throws on error)
//   const secret = process.env.JWT_SECRET
//   if (!secret) {
//     throw new Error("Missing required environment variable: JWT_SECRET");
//   }

const user = await prisma.user.findUnique({
  where: { id },
  select: { emailVerified: true },
});

if (user?.emailVerified) {
  return NextResponse.json(
    {
      success: true,
      message: "Email already verified",
    },
    { status: 200 }
  );
}

  const dbToken = await prisma.verificationToken.findUnique({
    where: {
      userId: id,
    //   token,
    },
  });

//   Compare token from url with db token
  if (!dbToken) {
    return NextResponse.json(
      { 
       success: false, 
       error: 'Token does not match any user'
      },
      { status: 401 }
    );
  }

  // Check if token is expired
  if (dbToken.expires < new Date()) {
    return NextResponse.json(
      { 
       success: false, 
       error: "Invalid or expired verification link"
      },
      { status: 401 }
    );
  }

  // Check if token is valid
  const isValid = await bcrypt.compare(token, dbToken.token);
  if (!isValid) {
    return NextResponse.json(
      { 
       success: false, 
       error:"Invalid or expired verification link"
      },
      { status: 401 }
    );
  }

  // Verify the JWT (throws on error)
//   const secret = process.env.JWT_SECRET
//   if (!secret) {
//     throw new Error("Missing required environment variable: JWT_SECRET");
//   }

//   const payload = verifyJwt(token, secret);  
  

//   // Optional: ensure payload.id matches the passed-in id
//   if (payload.sub !== id) {
//     return NextResponse.json(
//       {
//        success: false, 
//        error: 'Token does not match any user'
//       },
//       { status: 404 }
//     );
//   }

  // Ensure the token matches the users token in Verification table
//   const verification = await prismaRoot.verificationToken.findFirst({
//     where: {
//       userId: id,
//       token,
//     },
//   });

//   if (!verification) {
//     return NextResponse.json(
//       { 
//        success: false, 
//        error: 'Token does not match any user'
//       },
//       { status: 404 }
//     );
//   }

await prisma.$transaction([
  prisma.user.update({
    where: { id },
    data: { emailVerified: true },
  }),
  prisma.verificationToken.delete({
    where: { userId: id },
  }),
]);


  return NextResponse.json(
   { 
    success: true,
    message: 'Email successfully verified'
   },
   { status: 200 }
 );

 } catch (err: unknown) {
  // Handle token errors gracefully
  const message =
    err instanceof Error ? "Invalid or expired verification link" : 'Unknown verification error';
  return NextResponse.json(
    { 
     success: false,
     error: message
    },
    { status: 401 }
  );
}
}