/**
 * Generates and displays a list of schedules
 * @author Austen Money
 */

// Import React
import React, { useReducer } from 'react';

// Import types
import Cart from '@/backend/types/Cart';
import Schedule from '@/backend/types/Schedule';
import Course from '@/backend/types/Course';

// Import helpers
import { generateSchedules } from '../helpers/generateSchedules';

// Import components
import { ThreeDots } from 'react-loader-spinner'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import Section from '@/backend/types/Section';
import TimeSlot from '@/backend/types/TimeSlot';

/*------------------------------------------------------------------------*/
/* -------------------------------- Types ------------------------------- */
/*------------------------------------------------------------------------*/

type FormInfoType = {
  // Given required course nums
  requiredCourseNums: string,
  // Given chooseAny course nums
  chooseAnyCourseNums: string,
  // Given chooseOne course nums
  chooseOneCourseNums: string,
  // Given min number of credits
  minCredits: number,
  // Given max number of credits
  maxCredits: number,
};

type CalendarDate = {
  title: string,
  description: string,
  start: string,
  end: string,
};

enum WeekDays {
  'Sunday' = '2024-01-21',
  'Monday' = '2024-01-22',
  'Tuesday' = '2024-01-23',
  'Wednesday' = '2024-01-24',
  'Thursday' = '2024-01-25',
  'Friday' = '2024-01-26',
  'Saturday' = '2024-01-27',
};

/*------------------------------------------------------------------------*/
/* -------------------------------- State ------------------------------- */
/*------------------------------------------------------------------------*/

/* -------- State Definition -------- */

type State = {
  // Given info from form
  formInfo: FormInfoType,
  // Schedules generated from cart
  schedules?: Schedule[],
  // Whether to show the loading spinner
  showLoadingSpinner?: boolean,
};

/* ------------- Actions ------------ */

// Types of actions
enum ActionType {
  // Update form info
  UpdateFormInfo = 'UpdateFormInfo',
  // Generate the schedules
  GenerateSchedules = 'GenerateSchedules',
  // Toggle whether to show the loading spinner
  ToggleLoadingSpinner = 'ToggleLoadingSpinner',
}

// Action definitions
type Action = (
  | {
    // Action type
    type: ActionType.UpdateFormInfo,
    // Which form info to update
    formInfoToUpdate: keyof FormInfoType,
    // New form info
    newFormInfo: string | number,
  }
  | {
    // Action type
    type: ActionType.GenerateSchedules,
    // New Schedules
    newSchedules: Schedule[],
  }
  | {
    // Action type
    type: ActionType.ToggleLoadingSpinner,
  }
);

/**
 * Reducer that executes actions
 * @author Austen Money
 * @param state current state
 * @param action action to execute
 * @returns updated state
 */
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.UpdateFormInfo: {
      return {
        ...state,
        formInfo: {
          ...state.formInfo,
          [action.formInfoToUpdate]: action.newFormInfo,
        },
      };
    }
    case ActionType.GenerateSchedules: {
      return {
        ...state,
        schedules: action.newSchedules,
      };
    }
    case ActionType.ToggleLoadingSpinner: {
      return {
        ...state,
        showLoadingSpinner: !state.showLoadingSpinner,
      };
    }
    default: {
      return state;
    }
  }
};

/*------------------------------------------------------------------------*/
/* --------------------------- Static Helpers --------------------------- */
/*------------------------------------------------------------------------*/

/**
 * Generate date Id string from a time and day of the week
 * @author Austen Money
 * @param time time of day
 * @param day day of the week
 * @returns date string to use in calendar
 */
const stringifyDate = (time: number, day: keyof typeof WeekDays): string => {
  // Ensure the input is a positive integer
  const positiveInteger = Math.floor(Math.abs(time));

  // Extract hours, minutes, and seconds
  const hours = Math.floor(positiveInteger / 100);
  const minutes = Math.floor(positiveInteger % 100);

  console.log(`hours: ${hours}, minutes: ${minutes}`);

  // Format the result with leading zeros
  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

  // Generate date string
  const date = `${WeekDays[day]}T${formattedTime}`;
  return date;
};

/**
 * Generate date Id string from a course section
 * @author Austen Money
 * @param section course section
 * @returns date ID string to use in calendar
 */
const generateDates = (course: Course): CalendarDate[] => {
  console.log('course title: ', course.title);
  // destructuring course
  const { 
    title,
    description,
    mainGroup,
    secondaryGroups,
  } = course;

  const dates: CalendarDate[] = [];

  // Get main group
  if (!mainGroup.selectedSection || !mainGroup.selectedSection.days || !mainGroup.selectedSection.time) {
    console.log('uh oh')
    return dates;
  }

  const {
    days,
    time,
  } = mainGroup.selectedSection;

  console.log('days: ', days);
  days.forEach((day) => {
    if (day === "Monday" || day === "Tuesday" || day === "Wednesday" || day === "Thursday" || day === "Friday" || day === "Saturday" || day === "Sunday") {
      console.log('AAAAHHHHHHHHH')
      dates.push({
        title,
        description,
        start: stringifyDate(time.start, day),
        end: stringifyDate(time.end, day),
      });
  }});

  console.log('dates: ', dates);
  return dates;
};

/*------------------------------------------------------------------------*/
/* ------------------------------ Component ----------------------------- */
/*------------------------------------------------------------------------*/

const DisplaySchedules: React.FC<{}> = () => {
  /*------------------------------------------------------------------------*/
  /* -------------------------------- Setup ------------------------------- */
  /*------------------------------------------------------------------------*/

  /* -------------- State ------------- */

  // Initial state
  const initialState: State = {
    formInfo: {
      requiredCourseNums: '',
      chooseAnyCourseNums: '',
      chooseOneCourseNums: '',
      minCredits: 12,
      maxCredits: 18,
    },
    schedules: [],
  };

  // Initialize state
  const [state, dispatch] = useReducer(reducer, initialState);

  // Destructure common state
  const {
    formInfo: {
      requiredCourseNums,
      chooseAnyCourseNums,
      chooseOneCourseNums,
      minCredits,
      maxCredits,
    },
    schedules,
    showLoadingSpinner,
  } = state;

  /*------------------------------------------------------------------------*/
  /* ------------------------- Component Functions ------------------------ */
  /*------------------------------------------------------------------------*/

  /**
   * Handle submission of form
   * @author Austen Money
   */
  const handleGeneration = async (e: any) => {
    e.preventDefault();
    console.log('Generating schedules...');
    //  Toggle loading spinner
    dispatch({
      type: ActionType.ToggleLoadingSpinner,
    });

    // Get courses from database
    let required = await Promise.all(requiredCourseNums.split(', ').map(async (courseNum) => {
      console.log(`Here it is: ${courseNum}`);
      const response = await fetch(`/api/courses/num?classNo=${courseNum}`, {
        method: "GET",
      });
      const responseJson = await response.json();
      return responseJson;
    }));
    
    required = required.filter((course) => course !== "Internal server error");
    console.log('required: ', required);
    
    let chooseAny = await Promise.all(chooseAnyCourseNums.split(', ').map(async (courseNum) => {
      console.log(`Here it is: ${courseNum}`);
      const response = await fetch(`/api/courses/num?classNo=${courseNum}`, {
        method: "GET",
      });
      const responseJson = await response.json();
      return responseJson;
    }))
    
    chooseAny = chooseAny.filter((course) => course.message !== "Internal server error");
    console.log('chooseAny: ', chooseAny);


    // Generate schedules
    const newSchedules = generateSchedules({
      required,
      chooseAny,
      chooseOne: [],
      creditReqs: {
        min: minCredits,
        max: maxCredits,
      },
    });

    console.log('newSchedules: ', newSchedules);

    // Update schedules
    if (typeof newSchedules !== 'string') {
      dispatch({
        type: ActionType.GenerateSchedules,
        newSchedules,
      });
    } else {
      console.log('Error generating schedules: ', newSchedules);
    }

    // Toggle loading spinner
    dispatch({
      type: ActionType.ToggleLoadingSpinner,
    });
  };

  /*------------------------------------------------------------------------*/
  /* ------------------------------- Render ------------------------------- */
  /*------------------------------------------------------------------------*/

  /*----------------------------------------*/
  /* ---------------- Modal --------------- */
  /*----------------------------------------*/

  // Modal that may be defined
  let modal: React.ReactNode;

  /* ------- AddFirstTypeOfModal ------ */

  if (showLoadingSpinner) {
    // Create modal
    modal = (
      <ThreeDots
        key="unique-modal-key"
        height="80"
        width="80"
        color="blue"
        ariaLabel="three-dots-loading"
      />
    );
  }

  /*----------------------------------------*/
  /* --------------- Main UI -------------- */
  /*----------------------------------------*/
  let calendarEvents: any[] = [];
  if (schedules && schedules.length > 0) {
    console.log('we are making events');
    calendarEvents = generateDates(schedules[0].courses[0]);
      // return {
      //   title: course.id,
      //   description: course.description,
      //   start: "2024-01-23T15:00:00",
      //   end: "2024-01-23T16:01:05",
      // };
  };

  return (
    <div className="bg-white h-full">
      <form 
        className="w-full px-4 py-4"
        onSubmit={handleGeneration}
      >
        <div className="flex flex-wrap -mx-3 mb-2">
          <div className="w-1/3 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-city">
              Min # of credits
            </label>
            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
                   type="number"
                   placeholder="12"
                   value={String(minCredits)}
                   onChange={(evt) => dispatch({
                    type: ActionType.UpdateFormInfo,
                    formInfoToUpdate: 'minCredits',
                    newFormInfo: evt.target.valueAsNumber,
                   })}
            />
          </div>
          <div className="w-1/3 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-zip">
              Max # of credits
            </label>
            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
                   type="number"
                   placeholder="12"
                   value={String(maxCredits)}
                   onChange={(evt) => dispatch({
                    type: ActionType.UpdateFormInfo,
                    formInfoToUpdate: 'maxCredits',
                    newFormInfo: evt.target.valueAsNumber,
                   })}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-1/3 px-3">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-last-name">
              Required
            </label>
            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                   type="text"
                   placeholder="23608, 23608"
                   value={requiredCourseNums}
                   onChange={(evt) => dispatch({
                    type: ActionType.UpdateFormInfo,
                    formInfoToUpdate: 'requiredCourseNums',
                    newFormInfo: evt.target.value,
                   })}
            />
          </div>
          <div className="w-1/3 px-3">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-last-name">
              Choose Any
            </label>
            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                   type="text"
                   placeholder="23608, 23608"
                   value={chooseAnyCourseNums}
                   onChange={(evt) => dispatch({
                    type: ActionType.UpdateFormInfo,
                    formInfoToUpdate: 'chooseAnyCourseNums',
                    newFormInfo: evt.target.value,
                   })}
            />
          </div>
          <div className="w-1/3 px-3">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-last-name">
              Choose One
            </label>
            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                   type="text"
                   placeholder="23608, 23608"
                   value={chooseOneCourseNums}
                   onChange={(evt) => dispatch({
                    type: ActionType.UpdateFormInfo,
                    formInfoToUpdate: 'chooseOneCourseNums',
                    newFormInfo: evt.target.value,
                   })}
            />
          </div>
        </div>
        <button
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
          type="submit"
        >
          Generate
        </button>
      </form>
      {/* Add Modal */}
      {modal}
      <div className='w-full px-4'>
        {/* <div> */}
          <FullCalendar
            views={{
              default: {
                type: "timeGridWeek",
                duration: { days: 7 },
              },
            }}
            validRange={{
              start: '2024-01-21',
              end: '2024-01-28'
            }}
            slotMinTime="07:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            headerToolbar={false}
            plugins={[timeGridPlugin]}
            events={calendarEvents}
            eventOverlap={false}
            displayEventTime={true}
            slotDuration="00:30:00"
          />
        {/* </div> */}
      </div>
    </div>
  );
};

/*------------------------------------------------------------------------*/
/* ------------------------------- Wrap Up ------------------------------ */
/*------------------------------------------------------------------------*/

// Export component
export default DisplaySchedules;
