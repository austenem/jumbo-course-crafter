import { NextResponse, NextRequest } from 'next/server';

// Import clientPromise
import clientPromise from '@/backend/lib/mongodb';

export async function GET (req: NextRequest) {
  try {
    // get classNo from URL
    const {searchParams} = new URL(req.url);
    const classNo = searchParams.get("classNo");

    const client = await clientPromise;

    // access db collection
    const db = client.db("JumboCourseCrafter");
    const collect = db.collection("CourseInfo");

    // Get course info from collection
    const result = (await collect.find({"mainGroup.allSections.classNo": classNo}).toArray())[0];

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ message: 'Internal server error :(' });
  }
}
