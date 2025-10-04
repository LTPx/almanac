import { NextResponse } from "next/server";
import { getAllLessons } from "@/lib/queries";

// GET /api/units
export async function GET() {
  try {
    const lessons = await getAllLessons();
    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { name, description, order } = body;

//     if (!name) {
//       return NextResponse.json({ error: "Name is required" }, { status: 400 });
//     }

//     const unit = await prisma.unit.create({
//       data: {
//         name,
//         description,
//         order: order || 1,
//         isActive: true
//       },
//       include: {
//         lessons: {
//           include: {
//             _count: {
//               select: {
//                 questions: true
//               }
//             }
//           }
//         },
//         _count: {
//           select: {
//             lessons: true
//           }
//         }
//       }
//     });

//     return NextResponse.json(unit, { status: 201 });
//   } catch (error) {
//     console.error("Error creating unit:", error);
//     return NextResponse.json(
//       { error: "Failed to create unit" },
//       { status: 500 }
//     );
//   }
// }
