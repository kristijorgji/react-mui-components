import React, { useState } from 'react';

import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    tableCellClasses,
} from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { format, isSameMonth } from 'date-fns';

import { Column, Day, Item, Row } from './DayModeView';
import EventItem from './EventItem';
import { Options } from './Scheduler';

interface Props {
    rows: Row[];
    options: Options;
    columns: Column[];
    legacyStyle?: boolean;
    searchResult: any;
    onTaskClick: (event: React.MouseEvent, task: Item) => void;
    onCellClick: (event: React.MouseEvent, row: Row, day?: Day) => void;
    onEventsChange?: (item: Item) => void;
}

function MonthModeView(props: Props) {
    const { rows, options, columns, legacyStyle, searchResult, onTaskClick, onCellClick, onEventsChange } = props;
    const theme = useTheme();
    const [state, setState] = useState<{
        rows?: Row[];
        itemTransfert?: {
            item: Item;
            rowIndex: number;
        } | null;
        transfertTarget?: {
            elementId: string;
            rowIndex: number;
        } | null;
    }>({});
    const today = new Date();
    const currentDaySx: SxProps = {
        width: 24,
        height: 22,
        margin: 'auto',
        display: 'block',
        paddingTop: '2px',
        borderRadius: '50%',
        //padding: '1px 7px',
        //width: 'fit-content'
    };

    const onCellDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const onCellDragStart = (e: React.DragEvent, item: Item, rowIndex: number) => {
        setState({
            ...state,
            itemTransfert: { item, rowIndex },
        });
    };

    const onCellDragEnter = (e: React.DragEvent, elementId: string, rowIndex: number) => {
        e.preventDefault();
        setState({
            ...state,
            transfertTarget: { elementId, rowIndex },
        });
    };

    const onCellDragEnd = (e: React.DragEvent) => {
        e.preventDefault();
        if (!state.itemTransfert && !state.transfertTarget) return;
        const transfert = state.itemTransfert;
        const transfertTarget = state.transfertTarget;
        const rowsCopy = Array.from(rows);
        const rowInd = rowsCopy.findIndex(d => parseInt(d.id) === transfertTarget!.rowIndex);

        if (rowInd !== -1) {
            const dayInd = rowsCopy[rowInd]?.days?.findIndex(d => d.id === transfertTarget!.elementId);
            if (dayInd !== -1) {
                const day = rowsCopy[rowInd]?.days![dayInd!];
                const splittedDate = transfert?.item?.date?.split('-');
                if (!transfert?.item?.day) {
                    // Get day of the date (DD)
                    transfert!.item.day = parseInt(splittedDate![2]);
                }
                if (transfert!.item.day !== day?.day) {
                    const itemCheck = day.data.findIndex(
                        item => item.day === transfert!.item.day && item.label === transfert!.item.label
                    );
                    if (itemCheck === -1) {
                        const prevDayEvents = rowsCopy[transfert!.rowIndex].days!.find(
                            d => d.day === transfert!.item.day
                        );
                        const itemIndexToRemove = prevDayEvents?.data?.findIndex(i => i.id === transfert!.item.id);
                        if (itemIndexToRemove === undefined || itemIndexToRemove === -1) {
                            return;
                        }
                        prevDayEvents?.data?.splice(itemIndexToRemove, 1);
                        transfert!.item.day = day?.day;
                        transfert!.item.date = format(day?.date, 'yyyy-MM-dd');
                        day.data.push(transfert!.item);
                        setState({
                            ...state,
                            rows: rowsCopy,
                            itemTransfert: null,
                            transfertTarget: null,
                        });
                        onEventsChange && onEventsChange(transfert!.item);
                    }
                }
            }
        }
    };

    const handleCellClick = (event: React.MouseEvent, row: Row, day?: Day) => {
        event.preventDefault();
        event.stopPropagation();
        if (day?.data?.length === 0 && onCellClick) {
            onCellClick(event, row, day);
        }
    };

    const renderTask = (tasks: Item[] = [], rowId: string) => {
        return tasks?.map((task, index) => {
            const condition = searchResult
                ? task?.groupLabel === searchResult?.groupLabel || task?.user === searchResult?.user
                : !searchResult;
            return (
                condition && (
                    <EventItem
                        isMonthMode
                        event={task}
                        rowId={rowId}
                        elevation={0}
                        boxSx={{ px: 0.5 }}
                        key={`item-d-${task?.id}-${rowId}`}
                        onClick={e => handleTaskClick(e, task)}
                        onDragStart={e => onCellDragStart(e, task, parseInt(rowId))}
                        sx={{
                            width: '100%',
                            py: 0,
                            my: 0.3,
                            color: '#fff',
                            display: 'inline-flex',
                            backgroundColor: task?.color || theme.palette.primary.light,
                        }}
                    />
                )
            );
        });
    };

    const handleTaskClick = (event: React.MouseEvent, task: Item) => {
        event.preventDefault();
        event.stopPropagation();
        onTaskClick && onTaskClick(event, task);
    };

    return (
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table size="small" aria-label="simple table" stickyHeader sx={{ minWidth: options?.minWidth || 650 }}>
                {legacyStyle && (
                    <TableHead sx={{ height: 24 }}>
                        <StyledTableRow>
                            {columns?.map((column, index) => (
                                <StyledTableCell align="center" key={column?.headerName + '-' + index}>
                                    {column?.headerName}
                                </StyledTableCell>
                            ))}
                        </StyledTableRow>
                    </TableHead>
                )}
                <TableBody>
                    {rows?.map((row, index) => (
                        <StyledTableRow
                            key={`row-${row.id}-${index}`}
                            sx={{
                                '&:last-child th': {
                                    border: 0,
                                    borderLeft: `1px ${theme.palette.divider} solid`,
                                    '&:firs-child': {
                                        borderLeft: 0,
                                    },
                                },
                            }}
                        >
                            {row?.days?.map((day, indexD) => {
                                const currentDay = day.day === today.getUTCDate() && isSameMonth(day.date, today);
                                return (
                                    <StyledTableCell
                                        scope="row"
                                        align="center"
                                        component="th"
                                        sx={{ px: 0.5, position: 'relative' }}
                                        key={`day-${day.id}`}
                                        onDragEnd={onCellDragEnd}
                                        onDragOver={onCellDragOver}
                                        onDragEnter={e => onCellDragEnter(e, day.id, parseInt(row.id))}
                                        onClick={event => handleCellClick(event, row, day)}
                                    >
                                        <Box sx={{ height: '100%', overflowY: 'visible' }}>
                                            {!legacyStyle && index === 0 && columns[indexD]?.headerName?.toUpperCase()}.
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    ...currentDaySx,
                                                    background: currentDay
                                                        ? alpha(theme.palette.primary.main, 1)
                                                        : undefined,
                                                    color: currentDay ? '#fff' : undefined,
                                                }}
                                            >
                                                {day.day}
                                            </Typography>
                                            {day?.data?.length > 0 && renderTask(day?.data, row.id)}
                                            {legacyStyle && day?.data?.length === 0 && (
                                                <EventNoteRoundedIcon
                                                    fontSize="small"
                                                    htmlColor={theme.palette.divider}
                                                />
                                            )}
                                        </Box>
                                    </StyledTableCell>
                                );
                            })}
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default MonthModeView;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        borderTop: `1px ${theme.palette.divider} solid !important`,
        borderBottom: `1px ${theme.palette.divider} solid !important`,
        borderLeft: `1px ${theme.palette.divider} solid !important`,
        '&:nth-of-type(1)': {
            borderLeft: `0px !important`,
        },
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 12,
        height: 96,
        width: 64,
        maxWidth: 64,
        cursor: 'pointer',
        verticalAlign: 'top',
        borderLeft: `1px ${theme.palette.divider} solid`,
        '&:nth-of-type(7n+1)': {
            borderLeft: 0,
        },
        '&:nth-of-type(even)': {
            //backgroundColor: theme.palette.action.hover
        },
    },
    [`&.${tableCellClasses.body}:hover`]: {
        //backgroundColor: "#eee"
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));
