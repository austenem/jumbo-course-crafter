import { NextApiRequest, NextApiResponse } from "next";

import { NextResponse } from 'next/server';

export async function GET () {
  try {
    return NextResponse.json({ message: 'verification successful :)' })
  } catch (err) {
    return NextResponse.json({ message: 'Internal server error :(' })
  }
}


// // Import clientPromise
// import clientPromise from '@/backend/lib/mongodb';
// import Course from '@/backend/types/Course';

// const getCourses = async (req: NextApiRequest, res: NextApiResponse) => {
//     try {
//       const client = await clientPromise;

//       // access db collection
//       const db = client.db("JumboCourseCrafter");
//       const collect = db.collection("CourseInfo");

//       // Get course info from collection
//       const result = await collect.find({}).toArray();
//       console.log(result);

//       res.status(201).json({ success: true, data: result });
//     } catch (e) {
//       res.status(400).json({ success: false });
//     }
// };

// export default getCourses;
