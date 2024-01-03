import { 
  addCourseToSchedule, 
  doesCourseConflict, 
  generateSchedules,
  areSchedulesIdentical,
} from './generateSchedules';
import * as dataJson from './data.json';

import Cart from './types/Cart';
import Course from './types/Course';
import Schedule from './types/Schedule';
import Section from './types/Section';
import Status from './types/Status';
import Weekday from './types/Weekday';
import TimeSlot from './types/TimeSlot';

/****************************************************************************************
                                      TESTING                                           
****************************************************************************************/

async function assert(message, conditionTest) {
  const [recieved, expected] = await conditionTest();
  if (recieved !== expected) {
      console.log(`ERROR: ${message}` || "Assertion failed");
      console.log(`Expected: ${expected}`);
      console.log(`Recieved: ${recieved}`);
  }
}

const myData: Course[] = dataJson;

const testCourseNums = [
  '20136', // etching
  '20650', // intermediate arabic
  '23695', // new chinese cinema
  '25358', // directed study
  '20996', // intro to environ fieldwork 
  '21496', // intermed french 
  '24387', // disability and public health
  '22904', // computation theory
  '20040', // intrm figure drawing 
  '24412', // semantics
  '24368', // painting space
  '24714', // independent study
]

var courses: { [courseNum: string] : Course; } = {};

testCourseNums.forEach((num) => {
  courses[num] = Object.values(myData).find((course) => course.mainGroup.allSections[0].classNo === num);
});


const testCart: Cart = {
  required: [
    courses['20136'],  // etching
    // courses['20650'],  // intermediate arabic
    // courses['23695'],  // new chinese cinema
    // courses['25358'],  // directed study
    // courses['20996'],  // intro to environ fieldwork
    // courses['21496'],  // intermed french
    // courses['24387'],  // disability and public health
    courses['22904'],  // computation theory
    courses['20040'],  // intrm figure drawing
    courses['24412'],   // semantics
    // courses['24368'],  // painting space
    // courses['24714'],  // independent study 
  ],
  chooseAny: [
    // courses['20136'],
    // courses['20650'],
    // courses['23695'],
    // courses['25358'],
    // courses['20996'],
    // courses['21496'],
    // courses['24387'],
    // courses['22904'],
    // courses['20040'],
    // courses['24412'],
    // courses['24368'],
    // courses['24714'],
  ],
  chooseOne: [
  ],
  creditReqs: {
    min: 14,
    max: 21,
  }
}

/******************************************************************************
 *                               Invalid tests                                *
 ******************************************************************************/

assert(
  'Empty cart returns error string.',
  async () => {
      const emptyCart: Cart = {
        required: [],
        chooseAny: [],
        chooseOne: [],
        creditReqs: {
          min: 0,
          max: 0,
        }
      };

      const emptyResponse = 'No courses given.';
      return [ JSON.stringify(generateSchedules(emptyCart)), JSON.stringify(emptyResponse) ];
  }
);

assert(
  'Cart with too many required credits returns error string.',
  async () => {
      const cart: Cart = {
        required: [
          courses['20136'],
        ],
        chooseAny: [],
        chooseOne: [],
        creditReqs: {
          min: 0,
          max: 3,
        }
      };

      const response = 'Your required classes exceed your max credit limit.';
      return [ JSON.stringify(generateSchedules(cart)), JSON.stringify(response) ];
    }
    );
    
    assert(
      'Cart with conflicting required courses returns error string.',
      async () => {
        const cart: Cart = {
          required: [
            courses['24412'],
            courses['23695'],
          ],
          chooseAny: [],
          chooseOne: [],
          creditReqs: {
            min: 0,
            max: 18,
          }
        };
        
      const response = 'Your required classes do not fit.';
      return [ JSON.stringify(generateSchedules(cart)), JSON.stringify(response) ];
  }
);

/******************************************************************************
 *                                Valid tests                                 *
 ******************************************************************************/

/*************************** Single Course Schedules **************************/

assert(
  'Single required course with single section returns one schedule.',
  async () => {
      const singleCart: Cart = {
        required: [ courses['20136'] ],
        chooseAny: [],
        chooseOne: [],
        creditReqs: {
          min: 0,
          max: 18,
        }
      };

      const singleResponse: Schedule[] = [{
        courses: [{
          ...courses['20136'],
          mainGroup: {
            ...courses['20136'].mainGroup,
            selectedSection: courses['20136'].mainGroup.allSections[0]
          },
        }],
        creditTotal: 4,
        weekTimes: [{
          day: 'Monday',
          times: [ {
            start: 1300,
            end: 1500,
          } ],
        }]
      }];
      return [ JSON.stringify(generateSchedules(singleCart), null, 2), JSON.stringify(singleResponse, null, 2) ];
  }
);

assert(
  'Single required course with no given time returns one schedule without times.',
  async () => {
      const singleCart: Cart = {
        required: [ courses['25358'] ],
        chooseAny: [],
        chooseOne: [],
        creditReqs: {
          min: 0,
          max: 18,
        }
      };

      const singleResponse: Schedule[] = [{
        courses: [{
          ...courses['25358'],
          mainGroup: {
            ...courses['25358'].mainGroup,
            selectedSection: courses['25358'].mainGroup.allSections[0]
          },
        }],
        creditTotal: 1,
        weekTimes: [],
      }];
      return [ JSON.stringify(generateSchedules(singleCart), null, 2), JSON.stringify(singleResponse, null, 2) ];
  }
);

assert(
  'Single chooseAny course with single section returns one schedule.',
  async () => {
      const singleCart: Cart = {
        required: [],
        chooseAny: [ courses['20136'] ],
        chooseOne: [],
        creditReqs: {
          min: 0,
          max: 18,
        }
      };

      const singleResponse: Schedule[] = [{
        courses: [{
          ...courses['20136'],
          mainGroup: {
            ...courses['20136'].mainGroup,
            selectedSection: courses['20136'].mainGroup.allSections[0]
          },
        }],
        creditTotal: 4,
        weekTimes: [{
          day: 'Monday',
          times: [ {
            start: 1300,
            end: 1500,
          } ],
        }]
      }];
      return [ JSON.stringify(generateSchedules(singleCart), null, 2), JSON.stringify(singleResponse, null, 2) ];
  }
);

assert(
  'Single chooseOne course pair, each with a single section, returns two schedules.',
  async () => {
      const cart: Cart = {
        required: [],
        chooseAny: [],
        chooseOne: [
          [
            courses['20136'],
            courses['24368']
          ],
        ],
        creditReqs: {
          min: 0,
          max: 18,
        }
      };

      const response: Schedule[] = [
        {
          courses: [{
            ...courses['20136'],
            mainGroup: {
              ...courses['20136'].mainGroup,
              selectedSection: courses['20136'].mainGroup.allSections[0]
            },
          }],
          creditTotal: 4,
          weekTimes: [{
            day: 'Monday',
            times: [ {
              start: 1300,
              end: 1500,
            } ],
          }]
        },
        {
          courses: [{
            ...courses['24368'],
            mainGroup: {
              ...courses['24368'].mainGroup,
              selectedSection: courses['24368'].mainGroup.allSections[0]
            },
          }],
          creditTotal: 4,
          weekTimes: [{
            day: 'Wednesday',
            times: [{
              start: 1430,
              end: 1930
            }],
          }]
        }
      ];
      return [ JSON.stringify(generateSchedules(cart), null, 2), JSON.stringify(response, null, 2) ];
  }
);

/************************** Multiple Section Schedules ************************/

assert(
  'Single required course with 3 lectures and 5 recs returns 15 schedules.',
  async () => {
      const cart: Cart = {
        required: [ courses[21496] ],
        chooseAny: [],
        chooseOne: [],
        creditReqs: {
          min: 0,
          max: 18,
        }
      };

      const expectedNumberOfSchedules = 15;
      const response = generateSchedules(cart);
      return [ response.length, expectedNumberOfSchedules ];
  }
);


// console.log('About to generate schedules...');
// const result = generateSchedules(testCart);
// console.log('Finished generating schedules!');

// if (typeof result === 'string') {
//   console.log('\n', result);
// } 

// else if (typeof result === 'undefined') {
//   console.log('`tis undefined');
// }

// else {
//   result.forEach((schedule) => {
//     console.log(`\nCourses:`);
//     console.log(schedule.courses.forEach((course) => {
//       console.log(course.title);
//       console.log(course.mainGroup.selectedSection.classNo);
//       console.log('Secondary groups:');
//       course.secondaryGroups.forEach((section) => {
//         console.log(section.selectedSection.classNo);
//       });
//     }));
//     console.log(`Credits: ${schedule.creditTotal}`);
//     console.log(`Weekdays: ${JSON.stringify(schedule.weekTimes, null, 2)}`);
//   });
//   // console.log(JSON.stringify(result, null, 2));
//   console.log(`\n\n${result.length} schedules generated!`);
