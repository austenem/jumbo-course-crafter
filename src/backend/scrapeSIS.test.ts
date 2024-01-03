import { scrapeSIS } from './scrapeSIS';

const getInfo = async () => {
  const result = JSON.stringify((await scrapeSIS()), null, 2);

  const fs = require('node:fs');
  fs.writeFile('/Users/austenmoney/Desktop/jumbo-course-crafter/algo/data.json', result, err => {
    if (err) {
      console.error(err);
    }
  });
  console.log('success!')
}

getInfo();