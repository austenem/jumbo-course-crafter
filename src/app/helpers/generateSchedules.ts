import Cart from '@/backend/types/Cart';
import Course from '@/backend/types/Course';
import Schedule from '@/backend/types/Schedule';
import Section from '@/backend/types/Section';
import SectionGroup from '@/backend/types/SectionGroup';

/* CONSTANTS */
const EMPTY_SCHEDULE: Schedule = {
  courses: [],
  creditTotal: 0,
  weekTimes: [],
}

/**
 * Add a single section to a schedule. 
 * @author Austen Money
 * @param section the section to add (may be undefined)
 * @param schedule the schedule to add the section to
 * @returns the updated schedule
 * @notes Assumes the section does not conflict with the schedule.
 */
const addSectionToSchedule = (section: Section | undefined, schedule: Schedule): Schedule => {
  // if section doesn't exist, don't add it
  if (!section) {
    return schedule;
  }

  const sectionToAdd = structuredClone(section);
  let updatedSchedule = structuredClone(schedule);

  // add credits from new sectionToAdd
  updatedSchedule.creditTotal += sectionToAdd.credits;

  // if section doesn't include days, return schedule
  if (!sectionToAdd.days) {
    return updatedSchedule;
  }

  // if the schedule doesn't already include the day of the new sectionToAdd, 
  // add it and the sectionToAdd time; otherwise, just add the sectionToAdd time
  sectionToAdd.days.forEach((day) => {
    let includedDay = updatedSchedule.weekTimes.find((time) => {
      return time.day === day;
    })

    // if section doesn't include time, return schedule
    if (!sectionToAdd.time) {
      return updatedSchedule;
    }
    
    includedDay
      ? includedDay.times.push(sectionToAdd.time)
      : updatedSchedule.weekTimes.push({
        day,
        times: [sectionToAdd.time],
      })
  });

  return updatedSchedule;
};

/**
 * Add a course to a schedule. 
 * @author Austen Money
 * @param course the course to add
 * @param schedule the schedule to add the course to
 * @returns the updated schedule
 * @notes Assumes the course does not conflict with the schedule.
 */
const addCourseToSchedule = (course: Course, schedule: Schedule): Schedule => {
  const courseToAdd = structuredClone(course);
  let updatedSchedule = structuredClone(schedule);

  // add courses 
  updatedSchedule.courses.push(courseToAdd);

  // add credits and update schedule times
  updatedSchedule = addSectionToSchedule(courseToAdd.mainGroup.selectedSection, updatedSchedule);
  for (let i = 0; i < courseToAdd.secondaryGroups.length; i++) {
    updatedSchedule = addSectionToSchedule(courseToAdd.secondaryGroups[i].selectedSection, updatedSchedule);
  }

  return updatedSchedule;
};

/**
 * Determines whether a single section conflicts with a given schedule. 
 * @author Austen Money
 * @param section the section to check (may be undefined)
 * @param schedule the schedule to check
 * @returns true if there is a schedule conflict, false if there is not
 */
const doesSectionConflict = (section: Section | undefined, schedule: Schedule): boolean => {
  let isThereConflict = false;
  
  // if section or section days don't exist, no conflict
  if (!section || !section.days) {
    return isThereConflict;
  }

  // check each weekday to determine whether there are conflicts
  section.days.forEach((day) => {
    // check whether weekday is already included in schedule
    let includedDay = schedule.weekTimes.find((time) => {
      return time.day === day;
    })
    
    // if weekday is included, check whether times conflict
    if (includedDay) {
      includedDay.times.forEach((time) => {
        if (section.time) {
          if (((section.time.end <= time.end) && (section.time.end >= time.start))
            || ((section.time.start <= time.end) && (section.time.start >= time.start))
            || ((time.end <= section.time.end) && (time.end >= section.time.start))
            || ((time.start <= section.time.end) && (time.start >= section.time.start))) {
              isThereConflict = true
            }}
         })
      }
    })

  return isThereConflict;
}

/**
 * Determines whether a course conflicts with a given schedule. 
 * @author Austen Money
 * @param course the course to check
 * @param schedule the schedule to check
 * @returns true if there is a schedule conflict, false if there is not
 */
const doesCourseConflict = (course: Course, schedule: Schedule): boolean => {
  if (doesSectionConflict(course.mainGroup.selectedSection, schedule)) {
    return true;
  }

  for (let i = 0; i < course.secondaryGroups.length; i++) {
    if (doesSectionConflict(course.secondaryGroups[i].selectedSection, schedule)) {
      return true;
    }
  }

  return false;
};

/**
 *  
 * @author Austen Money
 * @param 
 * @returns 
 */
const getSectionGroups = (course: Course): SectionGroup[] => {
  const sectionGroups: SectionGroup[] = [];

  if (course.mainGroup.allSections) {
    sectionGroups.push(course.mainGroup);
  }

  for (let i = 0; i < course.secondaryGroups.length; i++) {
    if (course.secondaryGroups[i].allSections) {
      sectionGroups.push(course.secondaryGroups[i]);
    }
  }

  return sectionGroups;
}

/**
 *  
 * @author Austen Money
 * @param 
 * @returns 
 */
const getCourseCreditTotal = (course: Course): number => {
  const sectionGroups: SectionGroup[] = getSectionGroups(course);
  let creditTotal = 0;

  sectionGroups.forEach((section) => {
    if (section.allSections) {
      creditTotal += section.allSections[0].credits;
    }
  })

  return creditTotal;
}

/**
 *  
 * @author Austen Money
 * @param 
 * @returns 
 */
const getDomainSize = (course: Course): number => {
  const courseGroups = getSectionGroups(course);

  let domainSize = 0;
  courseGroups.forEach((group: SectionGroup) => {
    if (group.allSections) {
      domainSize += group.allSections.length;
    }
  });

  return domainSize;
}

/**
 *  
 * @author Austen Money
 * @param 
 * @returns 
 */
const areSchedulesIdentical = (scheduleA: Schedule, scheduleB: Schedule): boolean => {
  if ((scheduleA.courses.length !== scheduleB.courses.length)
      || (scheduleA.creditTotal !== scheduleB.creditTotal)
      || (scheduleA.weekTimes.length !== scheduleB.weekTimes.length)
      || (scheduleA.weekTimes.find((weekTime, i) => {
        return weekTime.times.length !== scheduleB.weekTimes[i].times.length;
      }))
  ) {
    return false;
  }

  const coursesA = structuredClone(scheduleA.courses);
  const coursesB = structuredClone(scheduleB.courses);

  coursesA.sort((a, b) => a.title.localeCompare(b.title));
  coursesB.sort((a, b) => a.title.localeCompare(b.title));

  const testTitles = coursesA.find((courseA, i) => {
    return courseA.title !== coursesB[i].title;
  });

  const testDays = scheduleA.weekTimes.find((weekTimeA, i) => {
    return weekTimeA.day !== scheduleB.weekTimes[i].day;
  });

  const testTimes = scheduleA.weekTimes.find((weekTimeA, i) => {
    const weekTimeB = scheduleB.weekTimes[i];
    return weekTimeA.times.find((timeA, p) => {
      const timeB = weekTimeB.times[p];
      return (
        timeA.start !== timeB.start
        || timeA.end !== timeB.end
      )
    })
  })

  if (testTitles || testDays || testTimes) {
    return false;
  }

  return true;
}

/**
 *  
 * @author Austen Money
 * @param 
 * @returns 
 */
const shuffleArray = (array: any[]): any[] => {
  let shuffledArray = structuredClone(array);

  for (let i = shuffledArray.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = shuffledArray[i];
      shuffledArray[i] = shuffledArray[j];
      shuffledArray[j] = temp;
  }

  return shuffledArray;
}

/**
 *  
 * @author Austen Money
 * @param cart the cart the schedule will draw courses from
 * @returns 
 */
const backtrackRequired = (
  schedule: Schedule,
  remainingCourses: Course[],
): Schedule | string => {
  const currSchedule = structuredClone(schedule);
  const currRemainingCourses = structuredClone(remainingCourses);

  // if we've added all required classes, return the finished schedule 
  if (currRemainingCourses.length === 0) {
    return currSchedule;
  }

  // find course section in currRemainingCourses with the smallest domain
  let currIdx = 0;
  let curr = currRemainingCourses[currIdx];

  for (let i = 0; i < currRemainingCourses.length; i++) {
    if (getDomainSize(currRemainingCourses[i]) < getDomainSize(curr)) {
      currIdx = i;
      curr = currRemainingCourses[i];
    }
  }

  // try assigning a section to each required sectionGroup in curr, 
  // backtracking whenever the domain of a neighboring course is emptied
  const currGroups = getSectionGroups(curr);

  for (let i = 0; i < currGroups.length; i++) {
    const currGroup = currGroups[i];
    const currGroupAllSections = currGroups[i].allSections;
    const currAllSections = (
      currGroupAllSections
        ? shuffleArray(currGroupAllSections)
        : []
    );
    for (let p = 0; p < currAllSections.length; p++) {
      // const randomIdx = Math.floor(Math.random() * currAllSections.length);
      const currSection = currAllSections[p];
      
      if (!doesSectionConflict(currSection, currSchedule)) {
        // set selected section to current section and remove from domain
        currGroup.selectedSection = currSection;
        currAllSections.splice(p, 1);
        // if curr has a selected section from all required groups, 
        // add to currSchedule and remove from currRemainingCourses
        let currReady = true;
        currGroups.forEach((group: SectionGroup) => {
          if (group.selectedSection === undefined) {
            currReady = false;
          }
        })

        if (currReady) {
          const updatedSchedule = addCourseToSchedule(curr, currSchedule);
          let updatedCourses = currRemainingCourses;
          updatedCourses.splice(currIdx, 1);

          const result = backtrackRequired(updatedSchedule, updatedCourses);
          if (typeof result !== "string") {
            return result;
          }
        }
      }
    }
  }

  return 'Your required classes do not fit.';
}

/**
 *  
 * @author Austen Money
 * @param cart the cart the schedule will draw courses from
 * @returns 
 */
const backtrackRandom = (
  courses: Course[],
  creditTotal: number,
  cart: Cart,
): Course[] | string => {
  const currCourses = structuredClone(courses);
  const currCart = structuredClone(cart);
  
  // destructure props
  const {
    chooseAny,
    chooseOne,
    creditReqs,
  } = currCart;

  if (
    (creditTotal >= ((creditReqs.min + creditReqs.max) / 2)) 
    || ((chooseAny.length === 0) && (chooseOne.length === 0))
  ) {
    return currCourses;
  }

  let randomCategory: Course[] | Course[][];
  if (chooseOne.length === 0) {
    randomCategory = chooseAny;
  } else if (chooseAny.length === 0) {
    randomCategory = chooseOne;
  } else {
    const randomIdx = Math.floor(Math.random() * 2);
    randomIdx === 0
      ? randomCategory = chooseAny
      : randomCategory = chooseOne
  }

  let randomCourse: Course;
  if (randomCategory === chooseAny) {
    const randomIdx = Math.floor(Math.random() * chooseAny.length);
    randomCourse = chooseAny[randomIdx];
    chooseAny.splice(randomIdx, 1);
  } else {
    const randomGroupIdx = Math.floor(Math.random() * chooseOne.length);
    const randomGroup = chooseOne[randomGroupIdx];
    chooseOne.splice(randomGroupIdx, 1);

    const randomIdx = Math.floor(Math.random() * randomGroup.length);
    randomCourse = randomGroup[randomIdx];
  }

  // choose a class at random from chooseAny and attempt to add to the 
  // schedule; repeat until we meet our credit limit
  currCourses.push(randomCourse);

  const result = backtrackRequired(EMPTY_SCHEDULE, currCourses);

  if (typeof result !== 'string') {
    const randomResult = backtrackRandom(currCourses, (creditTotal + getCourseCreditTotal(randomCourse)), currCart)

    if (typeof randomResult !== 'string') {
      return randomResult;
    }
  }

  return 'No valid schedule found.';
}

/**
 * Generates a list of up to ten possible schedules based on a given cart. 
 * @author Austen Money
 * @param cart the cart the schedule will draw courses from
 * @returns A string containing an error if the cart is requesting an impossible schedule, 
 *  or an array of up to ten schedules conforming to the cart request.
 */
const generateSchedules = (cart: Cart): Schedule[] | string => {
  const cartClone = structuredClone(cart);
  // destructure props
  const {
    required,
    chooseAny,
    chooseOne,
    creditReqs,
  } = cartClone;

  // if required classes exceeded the credit max, return error
  let requiredCreditTotal = 0; 

  // if no classes are given, return error
  if (required.length === 0 && chooseAny.length === 0 && chooseOne.length === 0) {
    return 'No courses given.';
  }

  required.forEach((course) => {
    requiredCreditTotal += getCourseCreditTotal(course);
  })

  if (requiredCreditTotal > creditReqs.max) {
    return 'Your required classes exceed your max credit limit.'
  } 

  // ensure there is no conflict between required classes and add all to schedule
  const backtrackResult: Schedule | string = backtrackRequired(EMPTY_SCHEDULE, required);

  if (typeof backtrackResult === 'string') {
    return backtrackResult;
  }

  // otherwise, we know the required classes created a valid schedule, and we 
  // generate up to ten valid schedules
  let schedules: Schedule[] = [];
  let i = 0;
  while (i < 100 && (schedules.length < 20)) {
    i++;
    const result: Course[] | string = backtrackRandom(cartClone.required, requiredCreditTotal, cartClone);
    if (typeof result !== 'string') {
      const newSchedule = backtrackRequired(EMPTY_SCHEDULE, result);
      if (typeof newSchedule !== 'string') {
        const findDuplicate = schedules.find((schedule) => {
          return areSchedulesIdentical(schedule, newSchedule);
        })

        if (!findDuplicate) {
          schedules.push(newSchedule);
        } 
      }
    }
  }

  return schedules;
};

export { addCourseToSchedule, doesCourseConflict, generateSchedules, areSchedulesIdentical };