import React from 'react';

import { Meta, Story } from '@storybook/react';

import { Item } from './DayModeView';
import Scheduler, { SchedulerProps } from './Scheduler';

export default {
    title: 'Components/Scheduler',
    component: Scheduler,
    argTypes: {
        backgroundColor: { control: 'color' },
    },
} as Meta;

// Create a master template for mapping args to render the Scheduler component
const Template: Story<SchedulerProps> = args => <Scheduler {...args} />;

// Reuse that template for creating different stories
export const Primary = Template.bind({});

const events: Item[] = [
    {
        id: 'event-1',
        label: 'Medical consultation',
        groupLabel: 'Dr Shaun Murphy',
        user: 'Dr Shaun Murphy',
        color: '#f28f6a',
        startHour: '04:00 AM',
        endHour: '05:00 AM',
        date: '2022-05-05',
        createdAt: new Date(),
        createdBy: 'Kristina Mayer',
    },
    {
        id: 'event-2',
        label: 'Medical consultation',
        groupLabel: 'Dr Claire Brown',
        user: 'Dr Claire Brown',
        color: '#099ce5',
        startHour: '09:00 AM',
        endHour: '10:00 AM',
        date: '2022-05-09',
        createdAt: new Date(),
        createdBy: 'Kristina Mayer',
    },
    {
        id: 'event-3',
        label: 'Medical consultation',
        groupLabel: 'Dr Menlendez Hary',
        user: 'Dr Menlendez Hary',
        color: '#263686',
        startHour: '13 PM',
        endHour: '14 PM',
        date: '2022-05-10',
        createdAt: new Date(),
        createdBy: 'Kristina Mayer',
    },
    {
        id: 'event-4',
        label: 'Consultation prénatale',
        groupLabel: 'Dr Shaun Murphy',
        user: 'Dr Shaun Murphy',
        color: '#f28f6a',
        startHour: '08:00 AM',
        endHour: '09:00 AM',
        date: '2022-05-11',
        createdAt: new Date(),
        createdBy: 'Kristina Mayer',
    },
] as unknown as Item[];

Primary.args = {
    i18n: {
        day: 'Month',
        week: 'Week',
        month: 'Day',
        days: {
            mon: 'Mon',
            tue: 'Tue',
            wed: 'Wed',
            thu: 'Thu',
            fri: 'Fri',
            sat: 'Sat',
            sun: 'Sun',
        },
        search: 'Search...',
        timeline: 'Timeline',
    },
    events: events,
    options: {
        transitionMode: 'zoom', // or fade
        startWeekOn: 'mon', // or sun
        defaultMode: 'month', // or week | day | timeline
        minWidth: 540,
        maxWidth: 540,
        minHeight: 540,
        maxHeight: 540,
    },
    toolbarProps: {
        showSearchBar: true,
        showSwitchModeButtons: true,
        showDatePicker: true,
    },
};
