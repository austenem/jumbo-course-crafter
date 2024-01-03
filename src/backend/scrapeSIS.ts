import Course from './types/Course';
import Section from './types/Section';
import Weekday from './types/Weekday';

const puppeteer = require('puppeteer');

const SIS_URL = 'https://sis.it.tufts.edu/psp/paprd/EMPLOYEE/EMPL/h/?tab=TFP_CLASS_SEARCH#search_results/term/2242/career/ALL/subject/course/attr/keyword/instructor';
const EMPTY_COURSE = {
  id: '',
  title: '',
  dept: '',
  description: '',
  attributes: [],
  mainGroup: {
    selectedSection: undefined, 
    allSections: [],
  },
  secondaryGroups: [],
};
const WEEKDAYS = [
  'Mo',
  'Tu',
  'We',
  'Th',
  'Fr',
  'Sa',
  'Su',
];

/**
 * 
 * @author Austen Money
 * @param jsPath path to element in DOM
 * @returns inner text of element
 */
const getJSText = async (jsPath: string, page: any): Promise<string> => {
  const [element] = await page.$$(jsPath);
  const text = await element.getProperty('textContent');
  return await text.jsonValue();
}

/**
 * 
 * @author Austen Money
 * @param xPath path to element in DOM
 * @returns inner text of element
 */
const getXText = async (jsPath: string, page: any): Promise<string> => {
  const [element] = await page.$x(jsPath);
  const text = await element.getProperty('textContent');
  return await text.jsonValue();
}

/**
 * 
 * @param time12h time in 12 hour format
 * @returns time in 24 hour format
 */
const convertTime12to24 = (time12h) => {
  const time = time12h.slice(0, -2);
  const modifier = time12h.slice(-2);

  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}${minutes}`;
}

/**
 * 
 * @param divNum the div number to search
 * @param trNum the tr number to search
 * @returns new section object
 */
const getSection = async (div1Num: number, div2Num: number, trNum: number, page: any): Promise<Section> => {
  const sectionId = await getJSText(`#TFP_CLSSRCH_accordion > div:nth-child(${div1Num}) > div > div.tfp-sections > div:nth-child(${div2Num}) > table > tbody > tr:nth-child(${trNum}) > td:nth-child(1)`, page);
  const sectionClassNo = await getJSText(`#TFP_CLSSRCH_accordion > div:nth-child(${div1Num}) > div > div.tfp-sections > div:nth-child(${div2Num}) > table > tbody > tr:nth-child(${trNum}) > td:nth-child(2)`, page);
  const sectionSession = await getJSText(`#TFP_CLSSRCH_accordion > div:nth-child(${div1Num}) > div > div.tfp-sections > div:nth-child(${div2Num}) > table > tbody > tr:nth-child(${trNum}) > td:nth-child(3)`, page);
  const sectionFaculty = await getJSText(`#TFP_CLSSRCH_accordion > div:nth-child(${div1Num}) > div > div.tfp-sections > div:nth-child(${div2Num}) > table > tbody > tr:nth-child(${trNum}) > td:nth-child(4) > div > div.tfp-ins`, page);
  const sectionCredits = await getJSText(`#TFP_CLSSRCH_accordion > div:nth-child(${div1Num}) > div > div.tfp-sections > div:nth-child(${div2Num}) > table > tbody > tr:nth-child(${trNum}) > td:nth-child(5)`, page);
  const [ sectionStatusHTML ] = await page.$$(`#TFP_CLSSRCH_accordion > div:nth-child(${div1Num}) > div > div.tfp-sections > div:nth-child(${div2Num}) > table > tbody > tr:nth-child(${trNum}) > td:nth-child(6) > img`);
  const sectionStatusProperty = await sectionStatusHTML.getProperty('title');
  const sectionStatus = await sectionStatusProperty.jsonValue();

  // get location
  const sectionLocationDates = (await getJSText(`#TFP_CLSSRCH_accordion > div:nth-child(${div1Num}) > div > div.tfp-sections > div:nth-child(${div2Num}) > table > tbody > tr:nth-child(${trNum}) > td:nth-child(4) > div > div.tfp-loc`, page)).trim();

  const sectionLocation = (
    sectionLocationDates.split('\n')[3] === undefined
      ? `${sectionLocationDates.split('\n')[2]}`
      : `${sectionLocationDates.split('\n')[2]}, ${sectionLocationDates.split('\n')[3]}`
  );

  let section: Section = {
    id: sectionId.split('\n')[1],
    classNo: sectionClassNo,
    session: sectionSession,
    faculty: sectionFaculty.trim().split(','),
    credits: Number(sectionCredits),
    status: sectionStatus,
    location: sectionLocation,
  };

  // get dates
  if (sectionLocationDates !== 'View Meeting Times') {
    const sectionDates = sectionLocationDates.split('\n')[0];

    if (!sectionDates.includes('Time Not Specified') && (sectionDates !== 'TBA')) {
      const sectionDays = sectionDates.match(/^\D+/);
      const sectionTimes = sectionDates.replace(/^\D+/, '');

      if (sectionDays !== null) {
        const sectionWeekdays: Weekday[] = sectionDays[0].split(', ').map((day) => {
          return Weekday[day.trim() as keyof typeof Weekday];
        });

        section = {
          ...section,
          days: sectionWeekdays,
        };
      }

      if (sectionTimes !== null) {
        const sectionStartTime = convertTime12to24(sectionTimes.split('-')[0].trim());
        const sectionNextPortion = sectionTimes.split('-')[1].trim();
        const isThereAnotherTime = WEEKDAYS.find((day) => sectionNextPortion.includes(day));

        const sectionEndTime = (
          isThereAnotherTime
            ? convertTime12to24(sectionNextPortion.split(isThereAnotherTime)[0].trim())
            : convertTime12to24(sectionTimes.split('-')[1].trim())
        );
    
        section = {
          ...section,
          time: {
            start: Number(sectionStartTime),
            end: Number(sectionEndTime),
          },
        }
      }
    }
  }

  return section;
}

/**
 *  
 * @author Austen Money
 * @returns a list of all courses in SIS
 */
const scrapeSIS = async (): Promise<Course[]> => {
  // set up puppeteer browser
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.goto(SIS_URL);

  // wait for catalog to load
  await page.waitForTimeout(15000);

  // retrieve number of courses
  const numOfCourses = (await page.$$("#TFP_CLSSRCH_accordion > div")).length

  // iterate through all courses and extract information
  const courses: Course[] = [];
  for (let i = 1; i <= numOfCourses; i++) {
    let currCourse: Course = structuredClone(EMPTY_COURSE);
    
    // get course title
    currCourse.title = (await getXText(`//*[@id="TFP_CLSSRCH_accordion"]/div[${i}]/a/span[2]`, page)).trim();

    // get course id
    const id = await getXText(`//*[@id="TFP_CLSSRCH_accordion"]/div[${i}]/a`, page);
    currCourse.id = id.replace(currCourse.title, '').trim();

    // get course description
    currCourse.description = (await getXText(`//*[@id="TFP_CLSSRCH_accordion"]/div[${i}]/p`, page)).trim();

    // get course department
    currCourse.dept = currCourse.id.replace(/[^A-Za-z]/g, '');

    // get main course sections
    const numOfMainSections = (await page.$$(`#TFP_CLSSRCH_accordion > div:nth-child(${i}) > div > div.tfp-sections > div:nth-child(1) > table > tbody > tr`)).length;

    for (let j = 1; j <= numOfMainSections; j++) {
      const mainSection = await getSection(i, 1, j, page);
      currCourse.mainGroup.allSections.push(mainSection);
  }

    // get secondary course sections
    const numOfSectionGroups = (await page.$$(`#TFP_CLSSRCH_accordion > div:nth-child(${i}) > div > div.tfp-sections > div`)).length;

    for (let j = 2; j <= numOfSectionGroups; j++) {
      const numOfSections = (await page.$$(`#TFP_CLSSRCH_accordion > div:nth-child(${i}) > div > div.tfp-sections > div:nth-child(${j}) > table > tbody > tr`)).length;
      currCourse.secondaryGroups.push({
        selectedSection: undefined,
        allSections: [],
      });
      for (let k = 1; k <= numOfSections; k++) {
        const section = await getSection(i, j, k, page);
        currCourse.secondaryGroups[j - 2].allSections.push(section);
      }
    }
    courses.push(currCourse);
  }
  browser.close();
  return courses;
}

export { scrapeSIS };