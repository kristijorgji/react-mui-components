import React from 'react';

import { Meta, Story } from '@storybook/react';

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
Primary.args = { label: 'Scheduler TODO 😃' };
