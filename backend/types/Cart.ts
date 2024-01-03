import Course from './Course';

type Cart = {
  required: Course[],
  chooseAny: Course[],
  chooseOne: Course[][],
  creditReqs: {
    min: number,
    max: number,
  },
};

export default Cart;