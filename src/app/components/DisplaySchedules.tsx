/**
 * Generates and displays a list of schedules
 * @author Austen Money
 */

// Import React
import Cart from '@/backend/types/Cart';
import Schedule from '@/backend/types/Schedule';
import React, { useReducer, useEffect } from 'react';

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

/**
 * Add description of helper
 * @author Austen Money
 * @param addArgName add arg description
 * @param addArgName add arg description
 * @returns add return description
 */
const addHelperName = (
  addRequiredArgName: addRequiredArgType,
  addOptionalArgName?: addOptionalArgType,
  addOptionalArgWithDefaultName?: addOptionalArgType = addArgDefault,
): addReturnType => {
  // TODO: implement
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

  /**
   * Add component helper function description
   * @author Austen Money
   * @param addArgName add description of argument
   * @param [addOptionalArgName] add description of optional argument
   * @returns add description of return
   */
  const addComponentHelperFunctionName = (
    addArgName: addArgType,
    addOptionalArgName?: addOptionalArgType,
  ): addReturnType => {
    // TODO: implement
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

  if (addLogicToDetermineIfModalIsVisible) {
    // TODO: implement

    // Create modal
    modal = (
      <Modal
        key="unique-modal-key"
        ...
      />
    );
  }

  /*----------------------------------------*/
  /* ---------------- Views --------------- */
  /*----------------------------------------*/

  // Body that will be filled with the current view
  let body: React.ReactNode;

  /* -------- AddFirstViewName -------- */

  if (view === View.AddViewName) {
    // TODO: implement

    // Create body
    body = (
      <addJSXOfBody />
    );
  }

  /* -------- AddSecondViewName -------- */

  if (view === View.AddViewName) {
    // TODO: implement

    // Create body
    body = (
      <addJSXOfBody />
    );
  }

  /*----------------------------------------*/
  /* --------------- Main UI -------------- */
  /*----------------------------------------*/

  return (
    <addContainersForBody>
      {/* Add Modal */}
      {modal}

      {/* Add Body */}
      {body}
    </addContainersForBody>
  );
};

/*------------------------------------------------------------------------*/
/* ------------------------------- Wrap Up ------------------------------ */
/*------------------------------------------------------------------------*/

// Export component
export default DisplaySchedules;
