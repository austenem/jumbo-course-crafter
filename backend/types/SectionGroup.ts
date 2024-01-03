import Section from './Section';

type SectionGroup = {
  selectedSection?: Section,
  allSections: Section[] | undefined,
};

export default SectionGroup;