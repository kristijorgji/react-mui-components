import React from 'react';

import TextField from '@mui/material/TextField/TextField';

export interface SchedulerProps {
    label: string;
}

const Scheduler: React.FC<SchedulerProps> = p => {
    return (
        <div>
            <TextField label={p.label} />
        </div>
    );
};
export default Scheduler;
