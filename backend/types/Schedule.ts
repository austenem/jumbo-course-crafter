import Course from './Course';
import TimeSlot from './TimeSlot';
import Weekday from './Weekday';

type Schedule = {
  courses: Course[],
  creditTotal: number,
  weekTimes: {
    day: string,
    times: TimeSlot[],
  }[]
};

export default Schedule;