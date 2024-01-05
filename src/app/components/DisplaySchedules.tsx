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
import Course from '@/backend/types/Course';

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
    formInfo: {
      requiredCourseNums: '',
      chooseAnyCourseNums: '',
      chooseOneCourseNums: '',
      minCredits: 12,
      maxCredits: 18,
    },
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
    // Toggle loading spinner
    // dispatch({
    //   type: ActionType.ToggleLoadingSpinner,
    // });

    // Get courses from database

    // console.log('woah')
    // const response = await fetch(`/api/courses/num?classNo=23608`, {
    //   method: "GET",
    // });
    // console.log('RESPONSE HERE:', response.body);
    // console.log('RESPONSE HERE:', (await response.json()));

    const required = await Promise.all(requiredCourseNums.split(', ').map(async (courseNum) => {
      console.log(`Here it is: ${courseNum}`);
      const response = await fetch(`/api/courses/num?classNo=${courseNum}`, {
        method: "GET",
      });
      const responseJson = await response.json();
      console.log('RESPONSE HERE:', responseJson);
      return responseJson;
    }));

    console.log('required: ', required);

    const chooseAny = await Promise.all(chooseAnyCourseNums.split(', ').map(async (courseNum) => {
      console.log(`Here it is: ${courseNum}`);
      const response = await fetch(`/api/courses/num?classNo=${courseNum}`, {
        method: "GET",
      });
      const responseJson = await response.json();
      console.log('RESPONSE HERE:', responseJson);
      return responseJson;
    }));

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

    // // Update schedules
    // dispatch({
    //   type: ActionType.GenerateSchedules,
    //   newSchedules,
    // });

    // // Toggle loading spinner
    // dispatch({
    //   type: ActionType.ToggleLoadingSpinner,
    // });
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
        color="purple"
        ariaLabel="three-dots-loading"
      />
    );
  }

  /*----------------------------------------*/
  /* --------------- Main UI -------------- */
  /*----------------------------------------*/
  console.log(minCredits)
  console.log(maxCredits)
  console.log(requiredCourseNums)
  console.log(chooseAnyCourseNums)
  console.log(chooseOneCourseNums)
  return (
    <div className="bg-white h-screen">
      {/* Add Modal */}
      {modal}

      {/* Add Body */}
      <form 
        className="w-full h-full px-4 py-4"
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
    </div>
  );
};

/*------------------------------------------------------------------------*/
/* ------------------------------- Wrap Up ------------------------------ */
/*------------------------------------------------------------------------*/

// Export component
export default DisplaySchedules;
