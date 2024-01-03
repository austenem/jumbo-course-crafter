import { NextApiRequest, NextApiResponse } from "next";
import getCourses from './api/courses/route';

// const fetchData = async () => {
//   await fetch('http://localhost:3000/api/get-courses', {
//           method: 'GET',})
//       .then(res => {
//           if (res.ok) {
//               console.log("Successfully connected to database!");
//           } else {
//               console.log("Could not connect to database!");
//           }
//       });
// };
// getCourses();

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      Hey there! This is a Next.js + Tailwind CSS template.
    </main>
  )
}
