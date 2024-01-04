/**
 * Generates and displays a list of schedules
 * @author Austen Money
 */

// Import React
import React, { useReducer, useEffect } from 'react';

// Import types
import Cart from '@/backend/types/Cart';
import Schedule from '@/backend/types/Schedule';

// Import helpers
import { generateSchedules } from '../helpers/generateSchedules';

// Import components
import { ThreeDots } from 'react-loader-spinner'

/*------------------------------------------------------------------------*/
/* -------------------------------- Types ------------------------------- */
/*------------------------------------------------------------------------*/

type ChooseOnePair = {
  classOne: string,
  classTwo: string,
};

/*------------------------------------------------------------------------*/
/* -------------------------------- State ------------------------------- */
/*------------------------------------------------------------------------*/

/* -------- State Definition -------- */

type State = {
  // Given required course nums
  requiredCourseNums: string[],
  // Given chooseAny course nums
  chooseAnyCourseNums: string[],
  // Given chooseOne course nums
  chooseOneCourseNums: ChooseOnePair[],
  // Given min number of credits
  minCredits: number,
  // Given max number of credits
  maxCredits: number,
  // Schedules generated from cart
  schedules?: Schedule[],
  // Whether to show the loading spinner
  showLoadingSpinner?: boolean,
};

/* ------------- Actions ------------ */

// Types of actions
enum ActionType {
  // Change set of course nums
  UpdateCourseNums = 'UpdateCourseNums',
  // Change the number of credits
  UpdateCredits = 'UpdateCredits',
  // Generate the schedules
  GenerateSchedules = 'GenerateSchedules',
  // Toggle whether to show the loading spinner
  ToggleLoadingSpinner = 'ToggleLoadingSpinner',
}

// Action definitions
type Action = (
  | {
    // Action type
    type: ActionType.UpdateCourseNums,
    // Which course nums to update
    courseNumsToUpdate: (
      | 'requiredCourseNums'
      | 'chooseAnyCourseNums'
      | 'chooseOneCourseNums'
    ),
    // New course nums
    newCourseNums: string[] | ChooseOnePair[],
  }
  | {
    // Action type
    type: ActionType.UpdateCredits,
    // Which credits to update
    creditsToUpdate: (
      | 'minCredits'
      | 'maxCredits'
    ),
    // New credits
    newCredits: number,
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
    case ActionType.UpdateCourseNums: {
      return {
        ...state,
        [action.courseNumsToUpdate]: action.newCourseNums,
      };
    }
    case ActionType.UpdateCredits: {
      return {
        ...state,
        [action.creditsToUpdate]: action.newCredits,
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

// /**
//  * Add description of helper
//  * @author Austen Money
//  * @param addArgName add arg description
//  * @param addArgName add arg description
//  * @returns add return description
//  */
// const addHelperName = (
//   addRequiredArgName: addRequiredArgType,
//   addOptionalArgName?: addOptionalArgType,
//   addOptionalArgWithDefaultName?: addOptionalArgType = addArgDefault,
// ): addReturnType => {
//   // TODO: implement
// };

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
    requiredCourseNums: [],
    chooseAnyCourseNums: [],
    chooseOneCourseNums: [],
    minCredits: 0,
    maxCredits: 0,
  };

  // Initialize state
  const [state, dispatch] = useReducer(reducer, initialState);

  // Destructure common state
  const {
    requiredCourseNums,
    chooseAnyCourseNums,
    chooseOneCourseNums,
    minCredits,
    maxCredits,
    schedules,
    showLoadingSpinner,
  } = state;

  /*------------------------------------------------------------------------*/
  /* ------------------------- Component Functions ------------------------ */
  /*------------------------------------------------------------------------*/

  // /**
  //  * Add component helper function description
  //  * @author Austen Money
  //  * @param addArgName add description of argument
  //  * @param [addOptionalArgName] add description of optional argument
  //  * @returns add description of return
  //  */
  // const addComponentHelperFunctionName = (
  //   addArgName: addArgType,
  //   addOptionalArgName?: addOptionalArgType,
  // ): addReturnType => {
  //   // TODO: implement
  // };

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
        color="purple"
        ariaLabel="three-dots-loading"
      />
    );
  }

  /*----------------------------------------*/
  /* --------------- Main UI -------------- */
  /*----------------------------------------*/

  return (
    <div className="bg-white h-screen">
      {/* Add Modal */}
      {modal}

      {/* Add Body */}
      <form className="w-full h-full px-4 py-4">
        <div className="flex flex-wrap -mx-3 mb-2">
          <div className="w-1/3 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-city">
              Min # of credits
            </label>
            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-city" type="text" placeholder="12"/>
          </div>
          <div className="w-1/3 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-zip">
              Max # of credits
            </label>
            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-zip" type="text" placeholder="18"/>
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-1/3 px-3">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-last-name">
              Required
            </label>
            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-last-name" type="text" placeholder="23608"/>
          </div>
          <div className="w-1/3 px-3">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-last-name">
              Choose Any
            </label>
            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-last-name" type="text" placeholder="23608"/>
          </div>
          <div className="w-1/3 px-3">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-last-name">
              Choose One
            </label>
            <input className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-last-name" type="text" placeholder="23608"/>
          </div>
        </div>
        <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded">
          Generate
        </button>
      </form>
    </div>
  );
};

/*------------------------------------------------------------------------*/
/* ------------------------------- Wrap Up ------------------------------ */
/*------------------------------------------------------------------------*/

// Export component
export default DisplaySchedules;
