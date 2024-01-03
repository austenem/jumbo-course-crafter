import { NextResponse } from 'next/server';

// Import clientPromise
import clientPromise from '@/backend/lib/mongodb';


export async function GET () {
  try {
    const client = await clientPromise;

    // access db collection
    const db = client.db("JumboCourseCrafter");
    const collect = db.collection("CourseInfo");

    // Get course info from collection
    const result = (await collect.find({}).toArray());

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ message: 'Internal server error :(' });
  }
}
