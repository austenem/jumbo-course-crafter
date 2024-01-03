import { scrapeSIS } from './scrapeSIS';
// Import clientPromise
import clientPromise from "./lib/mongodb";

const updateDB = async () => {
  try {
      const client = await clientPromise;
      // acesses database JumboCourseCrafter
      const db = client.db("JumboCourseCrafter");
      // acesses collection CourseInfo
      const collect = db.collection("CourseInfo");

      // Get course info from scrapeSIS
      const result = await scrapeSIS();

      // Delete all previous course info
      await collect.deleteMany({})

      // Insert the updated course info
      await collect.insertMany(result)

      console.log('success!');
  } catch (e) {
      console.log(e);
  }
}

updateDB();