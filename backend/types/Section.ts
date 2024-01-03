import Status from './Status';
import Weekday from './Weekday';
import TimeSlot from './TimeSlot';

type Section = {
  id: string,
  classNo: string,
  session: string,
  faculty: string[],
  credits: number,
  status: string,
  location: string,
  days?: string[],
  time?: TimeSlot,
};

export default Section;