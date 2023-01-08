import React, { useContext, useEffect, useState } from 'react';

import ArchiveIcon from '@mui/icons-material/Archive';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import GridViewIcon from '@mui/icons-material/GridView';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import TodayIcon from '@mui/icons-material/Today';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import StaticDatePicker from '@mui/lab/StaticDatePicker';
import {
    Alert,
    AlertColor,
    Button,
    Collapse,
    Divider,
    Grid,
    Hidden,
    IconButton,
    IconButtonProps,
    ListItemIcon,
    Menu,
    MenuItem,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Toolbar,
    Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { add, format, getDaysInMonth, parse, sub } from 'date-fns';
import PropTypes from 'prop-types';

import DateFnsLocaleContext from './dateFnsContext';
import { Item } from './DayModeView';
import ToolbarSearchbar from './ToolbarSeachBar';

export type AlertProps = {
    color: 'success' | 'info' | 'warning';
    open: boolean;
    showActionButton: boolean;
    severity: AlertColor;
    message: string;
    showNotification?: boolean;
    delay?: number;
};

export type ToolbarProps = {
    showDatePicker: boolean;
    showSearchBar: boolean;
    showSwitchModeButtons: boolean;
};

interface Props {
    i18n: {
        search: string;
        month: string;
        week: string;
        day: string;
        timeline: string;
    };
    events: Item[];
    today: Date;
    switchMode: string;
    alertProps?: AlertProps;
    toolbarProps: ToolbarProps;
    onDateChange: (dayInMonth: number, date: Date) => void;
    onModeChange: (mode: string) => void;
    onSearchResult: (result: any) => void;
    onAlertCloseButtonClicked: (e: React.MouseEvent) => void;
}

function SchedulerToolbar({ i18n, ...props }: Props) {
    const {
        events,
        today,
        switchMode,
        alertProps,
        toolbarProps,
        onModeChange,
        onDateChange,
        onSearchResult,
        onAlertCloseButtonClicked,
    } = props;

    const theme = useTheme();
    const [mode, setMode] = useState(switchMode);
    const [searchResult, setSearchResult] = useState();
    const [anchorMenuEl, setAnchorMenuEl] = useState(null);
    const [anchorDateEl, setAnchorDateEl] = useState<HTMLElement | null>(null);
    const [selectedDate, setSelectedDate] = useState(today || new Date());
    const [daysInMonth, setDaysInMonth] = useState(getDaysInMonth(selectedDate));

    const openMenu = Boolean(anchorMenuEl);
    const openDateSelector = Boolean(anchorDateEl);
    const dateFnsLocale = useContext(DateFnsLocaleContext);
    console.log(SchedulerToolbar.name, mode);
    const isDayMode = mode.toLowerCase() === 'day';
    const isWeekMode = mode.toLowerCase() === 'week';
    const isMonthMode = mode.toLowerCase() === 'month';

    const commonIconButtonProps: Partial<IconButtonProps> = {
        size: 'medium',
        edge: 'start',
        color: 'inherit',
        'aria-label': 'menu',
    };
    const menus = [
        {
            label: 'Read events',
            icon: <PlayCircleOutlineIcon fontSize="small" />,
        },
        {
            label: 'Refresh',
            icon: <AutorenewIcon fontSize="small" />,
        },
        {
            label: 'Export',
            icon: <ArchiveIcon fontSize="small" />,
        },
        {
            label: 'Print',
            icon: <LocalPrintshopIcon fontSize="small" />,
        },
    ];

    const handleCloseMenu = () => {
        setAnchorMenuEl(null);
    };

    const handleOpenDateSelector = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorDateEl(event.currentTarget);
    };

    const handleCloseDateSelector = () => {
        setAnchorDateEl(null);
    };

    const handleChangeDate = (method: string | ((selectedDate: Date | number, options: Duration) => Date)) => {
        if (typeof method !== 'function') {
            return;
        }
        let options: any = { months: 1 };
        if (isWeekMode) {
            options = { weeks: 1 };
        }
        if (isDayMode) {
            options = { days: 1 };
        }
        const newDate = method(selectedDate, options);
        setDaysInMonth(getDaysInMonth(newDate));
        setSelectedDate(newDate);
    };

    const handleCloseAlert = (e: React.MouseEvent) => {
        onAlertCloseButtonClicked && onAlertCloseButtonClicked(e);
    };

    useEffect(() => {
        if (mode && onModeChange) {
            onModeChange(mode);
        }
        // eslint-disable-next-line
  }, [mode])

    useEffect(() => {
        onDateChange && onDateChange(daysInMonth, selectedDate);
        // eslint-disable-next-line
  }, [daysInMonth, selectedDate])

    useEffect(() => {
        onSearchResult && onSearchResult(searchResult);
        // eslint-disable-next-line
  }, [searchResult])

    useEffect(() => {
        if (switchMode !== mode) {
            setMode(switchMode);
        }
        // eslint-disable-next-line
    }, [switchMode]);

    return (
        <Toolbar
            variant="dense"
            sx={{
                px: '0px !important',
                display: 'block',
                borderBottom: `1px ${theme.palette.divider} solid`,
            }}
        >
            <Grid container spacing={0} alignItems="center" justifyContent="flex-end">
                <Grid item xs={1} sm md>
                    {toolbarProps?.showDatePicker && (
                        <Typography component="div" sx={{ display: 'flex' }}>
                            {/* @ts-ignore */}
                            <Hidden smDown>
                                <IconButton
                                    sx={{ ml: 0, mr: -0.1 }}
                                    {...commonIconButtonProps}
                                    onClick={() => handleChangeDate(sub)}
                                >
                                    <ChevronLeftIcon />
                                </IconButton>
                                <Button
                                    size="small"
                                    id="basic-button"
                                    aria-haspopup="true"
                                    //endIcon={<TodayIcon />}
                                    aria-controls="basic-menu"
                                    onClick={handleOpenDateSelector}
                                    sx={{ color: 'text.primary' }}
                                    aria-expanded={openDateSelector ? 'true' : undefined}
                                >
                                    {format(selectedDate, isMonthMode ? 'MMMM-yyyy' : 'PPP', { locale: dateFnsLocale })}
                                </Button>
                                <IconButton
                                    sx={{ ml: 0.2 }}
                                    {...commonIconButtonProps}
                                    onClick={() => handleChangeDate(add)}
                                >
                                    <ChevronRightIcon />
                                </IconButton>
                            </Hidden>
                            {/* @ts-ignore */}
                            <Hidden smUp>
                                <IconButton
                                    sx={{ ml: 0, 'aria-label': 'menu' }}
                                    {...commonIconButtonProps}
                                    size="small"
                                    onClick={handleOpenDateSelector}
                                >
                                    <TodayIcon />
                                </IconButton>
                            </Hidden>
                            <Menu
                                id="date-menu"
                                anchorEl={anchorDateEl}
                                open={openDateSelector}
                                onClose={handleCloseDateSelector}
                                MenuListProps={{ 'aria-labelledby': 'basic-button' }}
                            >
                                <LocalizationProvider locale={dateFnsLocale} dateAdapter={AdapterDateFns}>
                                    <StaticDatePicker
                                        displayStaticWrapperAs="desktop"
                                        value={selectedDate}
                                        // @ts-ignore
                                        onChange={newValue => {
                                            setDaysInMonth(getDaysInMonth(newValue));
                                            setSelectedDate(newValue);
                                            handleCloseDateSelector();
                                        }}
                                        // @ts-ignore
                                        renderInput={params => <TextField {...params} />}
                                    />
                                </LocalizationProvider>
                            </Menu>
                        </Typography>
                    )}
                </Grid>
                <Grid item xs sm md sx={{ textAlign: 'right' }}>
                    <Stack
                        direction="row"
                        sx={{
                            pr: 0.5,
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                        }}
                    >
                        {toolbarProps?.showSearchBar && (
                            <ToolbarSearchbar
                                i18n={{
                                    search: i18n.search,
                                }}
                                events={events}
                                onInputChange={newValue => {
                                    let newDate = new Date();
                                    // @ts-ignore
                                    if (newValue?.date) {
                                        // @ts-ignore
                                        newDate = parse(newValue.date, 'yyyy-MM-dd', today);
                                    }
                                    setDaysInMonth(getDaysInMonth(newDate));
                                    setSelectedDate(newDate);
                                    // @ts-ignore
                                    setSearchResult(newValue);
                                }}
                            />
                        )}
                        {/* @ts-ignore */}
                        <Hidden mdUp>
                            <IconButton
                                sx={{ mr: 0, 'aria-label': 'menu' }}
                                {...commonIconButtonProps}
                                size="small"
                                onClick={handleOpenDateSelector}
                            >
                                <GridViewIcon />
                            </IconButton>
                        </Hidden>
                        {/* @ts-ignore */}
                        <Hidden mdDown>
                            {toolbarProps?.showSwitchModeButtons && (
                                <ToggleButtonGroup
                                    exclusive
                                    value={mode}
                                    size="small"
                                    color="primary"
                                    aria-label="text button group"
                                    sx={{ mt: 0.2, mr: 1.3, display: 'contents' }}
                                    onChange={(e, newMode) => {
                                        setMode(newMode);
                                    }}
                                >
                                    {[
                                        { label: i18n['month'], value: 'month' },
                                        { label: i18n['week'], value: 'week' },
                                        { label: i18n['day'], value: 'day' },
                                        { label: i18n['timeline'], value: 'timeline' },
                                    ].map(tb => (
                                        <ToggleButton sx={{ mt: 0.5 }} key={tb.value} value={tb.value}>
                                            {tb.label}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            )}
                        </Hidden>
                    </Stack>
                </Grid>
                <Grid item xs={12} sx={{}}>
                    <Menu
                        id="menu-menu"
                        open={openMenu}
                        anchorEl={anchorMenuEl}
                        onClose={handleCloseMenu}
                        onClick={handleCloseMenu}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        {menus.map((menu, index) => (
                            <MenuItem key={menu.label}>
                                <ListItemIcon>{menu.icon}</ListItemIcon>
                                <Typography variant="body2">{menu.label}</Typography>
                            </MenuItem>
                        ))}
                        <Divider />
                        <MenuItem>
                            <ListItemIcon>
                                <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="body2">Settings</Typography>
                        </MenuItem>
                    </Menu>
                    <Collapse in={alertProps?.open}>
                        <Alert
                            color={alertProps?.color}
                            severity={alertProps?.severity}
                            sx={{ borderRadius: 0, mb: 0 }}
                            action={
                                alertProps?.showActionButton ? (
                                    <IconButton
                                        aria-label="close"
                                        color="inherit"
                                        size="small"
                                        onClick={handleCloseAlert}
                                    >
                                        <CloseIcon fontSize="inherit" />
                                    </IconButton>
                                ) : null
                            }
                        >
                            {alertProps?.message}
                        </Alert>
                    </Collapse>
                </Grid>
            </Grid>
        </Toolbar>
    );
}

SchedulerToolbar.propTypes = {
    today: PropTypes.object.isRequired,
    events: PropTypes.array.isRequired,
    switchMode: PropTypes.string.isRequired,
    alertProps: PropTypes.object,
    toolbarProps: PropTypes.object,
    onDateChange: PropTypes.func.isRequired,
    onModeChange: PropTypes.func.isRequired,
    onSearchResult: PropTypes.func.isRequired,
    onAlertCloseButtonClicked: PropTypes.func.isRequired,
};

SchedulerToolbar.defaultProps = {
    alertProps: {
        open: false,
        message: '',
        color: 'info',
        severity: 'info',
        showActionButton: true,
    },
    toolbarProps: {
        showSearchBar: true,
        showSwitchModeButtons: true,
        showDatePicker: true,
        showOptions: false,
    },
};

export default SchedulerToolbar;
