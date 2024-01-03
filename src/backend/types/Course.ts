import SectionGroup from './SectionGroup';

type Course = {
  id: string,
  title: string,
  dept: string,
  description: string,
  attributes: string[],
  mainGroup: SectionGroup,
  secondaryGroups: SectionGroup[],
};

export default Course;