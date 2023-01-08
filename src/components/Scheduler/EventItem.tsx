import React from 'react';

import { Box, Paper, Typography } from '@mui/material';
import { SxProps } from '@mui/system';

interface Props {
    event: {
        id?: string;
        label?: string;
    };
    rowId?: string;
    onClick?: (e: React.MouseEvent) => void;
    onDragStart?: React.DragEventHandler;
    isMonthMode?: boolean;
    boxSx?: SxProps;
    sx?: SxProps;
    elevation?: number;
}

function EventItem(props: Props) {
    const { event, rowId, sx, boxSx, elevation, onClick, onDragStart } = props;

    return (
        <Paper
            sx={sx}
            draggable
            onClick={onClick}
            onDragStart={onDragStart}
            elevation={elevation || 0}
            key={`item-d-${event?.id}-${rowId}`}
        >
            <Box sx={boxSx}>
                <Typography variant="body2" sx={{ fontSize: 11 }}>
                    {event?.label}
                </Typography>
            </Box>
        </Paper>
    );
}

export default EventItem;
