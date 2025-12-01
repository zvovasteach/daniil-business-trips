import dayjs from 'dayjs';

import { DAY_OF_WEEK } from '@/common/constants/dayOfWeek.ts';
import goalsData from '@/static/goals.json';
import jobTitlesData from '@/static/job-titles.json';

export const isDayWeekend = (date: string) => dayjs(date).day() === 6
  || dayjs(date).day() === 0;

export const getNumberOfWeekends = (date: string, duration: number) => {
  let currentDay = dayjs(date).day();
  let numberOfWeekends = 0;
  for (let i = 0; i < duration; i++) {
    if (currentDay === DAY_OF_WEEK.SUNDAY
      || currentDay === DAY_OF_WEEK.SATURDAY) {
      numberOfWeekends++;
    }
    if (currentDay === DAY_OF_WEEK.SUNDAY) {
      currentDay = 0;
    } else {
      currentDay++;
    }
  }
  return numberOfWeekends;
};

export const getTypeOfTrip = (goalId: number) => goalsData[goalId - 1]?.name;

export const getJobTitles = (jobTitleIds: number[]) => jobTitleIds.map((id) =>
  jobTitlesData.find((jobTitle) => jobTitle.id === id)?.name).join(', ');

export const getJobTitle = (jobTitleId: number) =>
  jobTitlesData.find((jobTitle) => jobTitle.id === jobTitleId)?.name;
