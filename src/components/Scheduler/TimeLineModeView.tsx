import React, { useContext } from 'react';

import ScheduleIcon from '@mui/icons-material/Schedule';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { format, parse } from 'date-fns';

import DateFnsLocaleContext from './dateFnsContext';
import { Item } from './DayModeView';

interface Props {
    options: {
        height?: number;
        maxHeight?: number;
    };
    rows: Item[];
    searchResult: any;
    onTaskClick: (event: React.MouseEvent, task: Item) => void;
}

function TimeLineModeView(props: Props) {
    const { options, rows, searchResult, onTaskClick } = props;
    const dateFnsLocale = useContext(DateFnsLocaleContext);

    const handleTaskClick = (event: React.MouseEvent, task: Item) => {
        event.preventDefault();
        event.stopPropagation();
        onTaskClick && onTaskClick(event, task);
    };

    let fileredEvents = rows?.sort((a, b) => -b?.startHour?.localeCompare(a?.startHour));
    if (searchResult) {
        fileredEvents = fileredEvents?.filter(event => event?.groupLabel === searchResult?.groupLabel);
    }
    return (
        <StyledContainer
            sx={{
                overflowY: 'auto',
                height: options?.height || 540,
                maxHeight: options?.maxHeight || 540,
            }}
        >
            {/* @ts-ignore */}
            <Timeline position="alternate">
                {fileredEvents?.map((task, index) => {
                    return (
                        <TimelineItem
                            key={`timeline-${index}`}
                            sx={{ cursor: 'pointer' }}
                            onClick={event => handleTaskClick(event, task)}
                        >
                            <TimelineOppositeContent
                                sx={{ m: 'auto 0' }}
                                align="right"
                                variant="body2"
                                color="text.secondary"
                            >
                                {task?.date &&
                                    format(parse(task?.date, 'yyyy-MM-dd', new Date()), 'PPP', {
                                        locale: dateFnsLocale as Locale,
                                    })}
                                <br />
                                <Typography variant="caption">
                                    {task?.startHour} - {task?.endHour}
                                </Typography>
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                <TimelineConnector />
                                <TimelineDot color="secondary" sx={{ backgroundColor: task?.color }}>
                                    {task?.icon || <ScheduleIcon />}
                                </TimelineDot>
                                <TimelineConnector />
                            </TimelineSeparator>
                            <TimelineContent sx={{ py: '12px', px: 2 }}>
                                <Typography variant="body1" component="span">
                                    {task?.label}
                                </Typography>
                                <Typography>{task?.groupLabel}</Typography>
                            </TimelineContent>
                        </TimelineItem>
                    );
                })}
            </Timeline>
        </StyledContainer>
    );
}

export default TimeLineModeView;

const StyledContainer = styled(Typography)(({ theme }) => ({
    '&::-webkit-scrollbar': {
        width: 7,
        height: 6,
    },
    '&::-webkit-scrollbar-track': {
        WebkitBoxShadow: 'inset 0 0 6px rgb(125, 161, 196, 0.5)',
    },
    '&::-webkit-scrollbar-thumb': {
        WebkitBorderRadius: 4,
        borderRadius: 4,
        background: 'rgba(0, 172, 193, .5)',
        WebkitBoxShadow: 'inset 0 0 6px rgba(25, 118, 210, .5)',
    },
    '&::-webkit-scrollbar-thumb:window-inactive': {
        background: 'rgba(125, 161, 196, 0.5)',
    },
}));
