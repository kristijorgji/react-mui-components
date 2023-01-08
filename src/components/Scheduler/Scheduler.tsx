import React, { useEffect, useReducer, useState } from 'react';

import { Fade, Grid, Paper, Slide, Zoom } from '@mui/material';
import {
    add,
    format,
    getDay,
    getDaysInMonth,
    getWeeksInMonth,
    isSameDay,
    parse,
    startOfDay,
    startOfMonth,
    startOfWeek,
    sub,
} from 'date-fns';
import { ar, de, enAU, es, fr, ja, ko, ru, zhCN } from 'date-fns/locale';

import DateFnsLocaleContext from './dateFnsContext';
import DayModeView, { Column, Day, Item, Row } from './DayModeView';
import MonthModeView from './MonthModeView';
import SchedulerToolbar, { AlertProps, ToolbarProps } from './SchedulerToolbar';
import TimeLineModeView from './TimeLineModeView';
import WeekModeView from './WeekModeView';

export type Options = {
    defaultMode?: string;
    startWeekOn?: string;
    transitionMode?: string;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
};

export interface SchedulerProps {
    i18n: {
        day: string;
        week: string;
        month: string;
        days: {
            mon: string;
            tue: string;
            wed: string;
            thu: string;
            fri: string;
            sat: string;
            sun: string;
        };
        search: string;
        timeline: string;
    };
    events: Item[];
    locale: string;
    options: Options;
    legacyStyle: boolean;
    rows: Row[];
    columns: Column[];
    alertProps?: AlertProps;
    onTaskClick: (event: React.MouseEvent, task: Item) => void;
    toolbarProps: ToolbarProps;
    onCellClick: (event: React.MouseEvent, row: Row, day?: Day | number) => void;
    onEventsChange?: (item: Item) => void;
    onAlertCloseButtonClicked: VoidFunction;
}

function Scheduler(props: SchedulerProps) {
    const {
        i18n,
        events,
        locale,
        options,
        alertProps,
        onCellClick,
        legacyStyle,
        onTaskClick,
        toolbarProps,
        onEventsChange,
        onAlertCloseButtonClicked,
    } = props;
    const today = new Date();
    const weeks = [
        i18n.days['mon'],
        i18n.days['tue'],
        i18n.days['wed'],
        i18n.days['thu'],
        i18n.days['fri'],
        i18n.days['sat'],
        i18n.days['sun'],
    ];

    const [state, setState] = useState<{
        columns?: Column[];
        rows?: Row[];
    }>({});
    const [searchResult, setSearchResult] = useState();
    const [selectedDay, setSelectedDay] = useState(today);
    const [alertState, setAlertState] = useState(alertProps);
    const [mode, setMode] = useState(options?.defaultMode || 'month');
    const [daysInMonth, setDaysInMonth] = useState(getDaysInMonth(today));
    const [startWeekOn, setStartWeekOn] = useState(options?.startWeekOn || 'mon');
    const [selectedDate, setSelectedDate] = useState(format(today, 'MMMM-yyyy'));
    const [weekDays, updateWeekDays] = useReducer(state => {
        if (options?.startWeekOn?.toUpperCase() === 'SUN') {
            return [
                i18n.days['sun'],
                i18n.days['mon'],
                i18n.days['tue'],
                i18n.days['wed'],
                i18n.days['thu'],
                i18n.days['fri'],
                i18n.days['sat'],
            ];
        }
        return weeks;
    }, weeks);

    console.log(Scheduler.name, mode);

    const isDayMode = mode.toLowerCase() === 'day';
    const isWeekMode = mode.toLowerCase() === 'week';
    const isMonthMode = mode.toLowerCase() === 'month';
    const isTimelineMode = mode.toLowerCase() === 'timeline';
    const TransitionMode =
        options?.transitionMode === 'zoom' ? Zoom : options?.transitionMode === 'fade' ? Fade : Slide;

    const dateFnsLocale = getDateFnsLocale(locale);

    const getMonthHeader = () => {
        return weekDays.map((day, i) => ({
            id: `row-day-header-${i + 1}`,
            flex: 1,
            sortable: false,
            editable: false,
            align: 'center',
            headerName: day,
            headerAlign: 'center',
            field: `rowday${i + 1}`,
            headerClassName: 'scheduler-theme--header',
        }));
    };

    const getMonthRows = (): Row[] => {
        const rows = [],
            daysBefore = [];
        const iteration = getWeeksInMonth(selectedDay);
        const startOnSunday =
            startWeekOn?.toUpperCase() === 'SUN' && i18n.days['sun'].toUpperCase() === weekDays[0].toUpperCase();
        const monthStartDate = startOfMonth(selectedDay); // First day of month
        const monthStartDay = getDay(monthStartDate); // Index of the day in week
        let dateDay = parseInt(format(monthStartDate, 'dd')); // Month start day
        // Condition check helper
        const checkCondition = (v: number) => (startOnSunday ? v <= monthStartDay : v < monthStartDay);
        if (monthStartDay >= 1) {
            // Add days of precedent month
            // If Sunday is the first day of week, apply b <= monthStartDay
            // and days: (monthStartDay-b) + 1
            for (let i = 1; checkCondition(i); i++) {
                const subDate = sub(monthStartDate, { days: monthStartDay - i + (startOnSunday ? 1 : 0) });
                const day = parseInt(format(subDate, 'dd'));
                const data = events.filter(event => isSameDay(subDate, parse(event?.date, 'yyyy-MM-dd', new Date())));
                daysBefore.push({
                    id: `day_-${day}`,
                    day: day,
                    date: subDate,
                    data: data,
                });
            }
        } else if (!startOnSunday) {
            for (let i = 6; i > 0; i--) {
                const subDate = sub(monthStartDate, { days: i });
                const day = parseInt(format(subDate, 'dd'));
                const data = events.filter(event => isSameDay(subDate, parse(event?.date, 'yyyy-MM-dd', new Date())));
                daysBefore.push({
                    id: `day_-${day}`,
                    day: day,
                    date: subDate,
                    data: data,
                });
            }
        }

        if (daysBefore.length > 0) {
            rows.push({ id: 0, days: daysBefore });
        }

        // Add days and events data
        for (let i = 0; i < iteration; i++) {
            const obj = [];

            for (
                let j = 0;
                // This condition ensure that days will not exceed 31
                // i === 0 ? 7 - daysBefore?.length means that we substract inserted days
                // in the first line to 7
                j < (i === 0 ? 7 - daysBefore.length : 7) && dateDay <= daysInMonth;
                j++
            ) {
                const date = parse(`${dateDay}-${selectedDate}`, 'dd-MMMM-yyyy', new Date());
                const data = events.filter(event => isSameDay(date, parse(event?.date, 'yyyy-MM-dd', new Date())));
                obj.push({
                    id: `day_-${dateDay}`,
                    date,
                    data,
                    day: dateDay,
                });
                dateDay++;
            }

            if (i === 0 && daysBefore.length > 0) {
                rows[0].days = rows[0].days.concat(obj);
                continue;
            }
            if (obj.length > 0) {
                rows.push({ id: i, days: obj });
            }
        }

        // Check if last row is not fully filled
        const lastRow = rows[iteration - 1];
        const lastRowDaysdiff = 7 - lastRow?.days?.length;
        const lastDaysData = [];

        if (lastRowDaysdiff > 0) {
            const day = lastRow.days[lastRow?.days?.length - 1];
            let addDate = day.date;
            for (let i = dateDay; i < dateDay + lastRowDaysdiff; i++) {
                addDate = add(addDate, { days: 1 });
                const d = format(addDate, 'dd');
                // eslint-disable-next-line
                let data = events.filter((event) => (
                    isSameDay(
                        addDate,
                        parse(event?.date, 'yyyy-MM-dd', new Date())
                    )));
                lastDaysData.push({
                    id: `day_-${d}`,
                    date: addDate,
                    day: d,
                    data,
                });
            }
            // @ts-ignore
            rows[iteration - 1].days = rows[iteration - 1].days.concat(lastDaysData);
        }

        return rows as unknown as Row[];
    };

    const getWeekHeader = (): Column[] => {
        const data = [];
        const weekStart = startOfWeek(selectedDay, { weekStartsOn: startWeekOn === 'mon' ? 1 : 0 });
        for (let i = 0; i < 7; i++) {
            const date = add(weekStart, { days: i });
            data.push({
                date: date,
                weekDay: format(date, 'iii', { locale: dateFnsLocale }),
                day: format(date, 'dd', { locale: dateFnsLocale }),
                month: format(date, 'MM', { locale: dateFnsLocale }),
            });
        }
        return data as unknown as Column[];
    };

    const getWeekRows = () => {
        const HOURS = 24; //* 2
        const data = [];
        let dayStartHour = startOfDay(selectedDay);

        for (let i = 0; i <= HOURS; i++) {
            const id = `line_${i}`;
            const label = format(dayStartHour, 'HH:mm aaa');

            //TODO Add everyday event capability
            //if (i === 0) {
            //id = `line_everyday`; label = 'Everyday'
            //}
            //TODO Place the processing bloc here if everyday capability is available
            // ...

            if (i > 0) {
                //Start processing bloc
                const obj = { id: id, label: label, days: [] };
                const columns = getWeekHeader();
                // eslint-disable-next-line
                columns.map((column, index) => {
                    const data = events.filter(event => {
                        const eventDate = parse(event?.date, 'yyyy-MM-dd', new Date());
                        return (
                            isSameDay(column!.date!, eventDate) &&
                            event?.startHour?.toUpperCase() === label?.toUpperCase()
                        );
                    });
                    // @ts-ignore
                    obj.days.push({
                        id: `column-${index}_m-${column.month}_d-${column.day}_${id}`,
                        date: column?.date,
                        data: data,
                    });
                });
                // Label affectation
                data.push(obj); // End processing bloc
                dayStartHour = add(dayStartHour, { minutes: 60 }); // 30
            }
            //if (i > 0) {
            //  dayStartHour = add(dayStartHour, {minutes: 30})
            //}
        }
        return data;
    };

    const getDayHeader = () => [
        {
            date: selectedDay,
            weekDay: format(selectedDay, 'iii', { locale: dateFnsLocale }),
            day: format(selectedDay, 'dd', { locale: dateFnsLocale }),
            month: format(selectedDay, 'MM', { locale: dateFnsLocale }),
        },
    ];

    const getDayRows = () => {
        const HOURS = 24;
        const data = [];
        let dayStartHour = startOfDay(selectedDay);

        for (let i = 0; i <= HOURS; i++) {
            const id = `line_${i}`;
            const label = format(dayStartHour, 'HH:mm aaa');

            if (i > 0) {
                const obj = { id: id, label: label, days: [] };
                const columns = getDayHeader();
                const column = columns[0];
                const matchedEvents = events.filter(event => {
                    const eventDate = parse(event?.date, 'yyyy-MM-dd', new Date());
                    return (
                        isSameDay(column?.date, eventDate) && event?.startHour?.toUpperCase() === label?.toUpperCase()
                    );
                });
                // @ts-ignore
                obj.days.push({
                    id: `column-_m-${column?.month}_d-${column?.day}_${id}`,
                    date: column?.date,
                    data: matchedEvents,
                });

                data.push(obj);
                dayStartHour = add(dayStartHour, { minutes: 60 });
            }
        }
        return data;
    };

    const getTimeLineRows = () =>
        //events.filter((event) => {
        //let eventDate = parse(event?.date, 'yyyy-MM-dd', new Date())
        //return isSameDay(selectedDay, eventDate)
        //})
        events;

    const handleDateChange = (day: number, date: Date) => {
        setDaysInMonth(day);
        setSelectedDay(date);
        setSelectedDate(format(date, 'MMMM-yyyy'));
    };

    const handleModeChange = (newMode: string) => {
        setMode(newMode);
    };

    const onSearchResult = (item: any) => {
        setSearchResult(item);
    };

    const handleEventsChange = async (item: Item) => {
        onEventsChange && onEventsChange(item);
        const eventIndex = events.findIndex(e => e.id === item?.id);
        if (eventIndex !== -1) {
            const oldObject = Object.assign({}, events[eventIndex]);
            if (alertState?.showNotification && !alertState.open) {
                setAlertState({
                    ...alertState,
                    open: true,
                    message: `
            ${item?.label} successfully moved from ${oldObject?.date}
            ${oldObject?.startHour} to ${item?.date} ${item?.startHour}
          `,
                });
                setTimeout(() => {
                    setAlertState({ ...alertState, open: false, message: '' });
                }, alertState.delay);
            }
        }
    };

    useEffect(() => {
        if (isMonthMode) {
            setState({
                ...state,
                columns: getMonthHeader(),
                rows: getMonthRows(),
            });
        }
        if (isWeekMode) {
            setState({
                ...state,
                columns: getWeekHeader(),
                rows: getWeekRows() as unknown as Row[],
            });
        }
        if (isDayMode) {
            setState({
                ...state,
                columns: getDayHeader() as unknown as Column[],
                rows: getDayRows() as unknown as Row[],
            });
        }
        if (isTimelineMode) {
            setState({
                ...state,
                columns: getDayHeader() as unknown as Column[],
                rows: getTimeLineRows() as unknown as Row[],
            });
        }
        // eslint-disable-next-line
    }, [
        mode,
        weekDays,
        daysInMonth,
        selectedDay,
        selectedDate,
        dateFnsLocale,
        startWeekOn
    ])

    useEffect(() => {
        if (options?.defaultMode && options?.defaultMode !== mode) {
            setMode(options?.defaultMode);
        }
    }, [options?.defaultMode]);

    useEffect(() => {
        if (options?.startWeekOn && options?.startWeekOn !== startWeekOn) {
            setStartWeekOn(options?.startWeekOn);
        }
        updateWeekDays();
    }, [options?.startWeekOn]);

    return (
        <Paper variant="outlined" elevation={0} sx={{ p: 0 }}>
            <DateFnsLocaleContext.Provider value={dateFnsLocale}>
                <SchedulerToolbar
                    i18n={i18n}
                    today={today}
                    events={events}
                    switchMode={mode}
                    alertProps={alertState}
                    toolbarProps={toolbarProps}
                    onDateChange={handleDateChange}
                    onModeChange={handleModeChange}
                    onSearchResult={onSearchResult}
                    onAlertCloseButtonClicked={onAlertCloseButtonClicked}
                />
                <Grid container spacing={0} alignItems="center" justifyContent="start">
                    {isMonthMode && (
                        <TransitionMode in>
                            <Grid item xs={12}>
                                <MonthModeView
                                    options={options}
                                    rows={state?.rows || []}
                                    columns={state?.columns || []}
                                    legacyStyle={legacyStyle}
                                    onTaskClick={onTaskClick}
                                    onCellClick={onCellClick}
                                    searchResult={searchResult}
                                    onEventsChange={handleEventsChange}
                                />
                            </Grid>
                        </TransitionMode>
                    )}
                    {isWeekMode && (
                        <TransitionMode in>
                            <Grid item xs={12}>
                                <WeekModeView
                                    events={events}
                                    options={options}
                                    date={selectedDate}
                                    rows={state?.rows || []}
                                    columns={state?.columns || []}
                                    onTaskClick={onTaskClick}
                                    onCellClick={onCellClick}
                                    searchResult={searchResult}
                                    onDateChange={handleDateChange}
                                    onEventsChange={handleEventsChange}
                                />
                            </Grid>
                        </TransitionMode>
                    )}
                    {isDayMode && (
                        <TransitionMode in>
                            <Grid item xs={12}>
                                <DayModeView
                                    options={options}
                                    rows={state?.rows || []}
                                    columns={state?.columns || []}
                                    onTaskClick={onTaskClick}
                                    onCellClick={onCellClick}
                                    searchResult={searchResult}
                                    onEventsChange={handleEventsChange}
                                />
                            </Grid>
                        </TransitionMode>
                    )}
                </Grid>
                {isTimelineMode && (
                    <TransitionMode in>
                        <Grid container spacing={2} alignItems="start">
                            <Grid item xs={12}>
                                <TimeLineModeView
                                    options={options}
                                    rows={(state?.rows as unknown as Item[]) || []}
                                    onTaskClick={onTaskClick}
                                    searchResult={searchResult}
                                />
                            </Grid>
                        </Grid>
                    </TransitionMode>
                )}
            </DateFnsLocaleContext.Provider>
        </Paper>
    );
}

export default Scheduler;

function getDateFnsLocale(locale: string): Locale {
    let dateFnsLocale = enAU;
    if (locale === 'fr') {
        dateFnsLocale = fr;
    }
    if (locale === 'ko') {
        dateFnsLocale = ko;
    }
    if (locale === 'de') {
        dateFnsLocale = de;
    }
    if (locale === 'es') {
        dateFnsLocale = es;
    }
    if (locale === 'ar') {
        dateFnsLocale = ar;
    }
    if (locale === 'ja') {
        dateFnsLocale = ja;
    }
    if (locale === 'ru') {
        dateFnsLocale = ru;
    }
    if (locale === 'zh') {
        dateFnsLocale = zhCN;
    }

    return dateFnsLocale;
}
