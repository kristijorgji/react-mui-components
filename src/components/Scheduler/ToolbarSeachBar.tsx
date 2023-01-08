import React, { useState } from 'react';

import { Autocomplete, Box, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { format, parse } from 'date-fns';

import { Item } from './DayModeView';

interface Props {
    i18n: {
        search: string;
    };
    events: Item[];
    onInputChange: (input: string) => void;
}

function ToolbarSearchbar({ i18n, ...props }: Props) {
    const { events, onInputChange } = props;
    const [value, setValue] = useState('');
    const [inputValue, setInputValue] = useState('');

    const handleOnChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
        if (onInputChange) {
            onInputChange(newValue);
        }
    };

    return (
        <StyledAutoComplete
            value={value}
            id="scheduler-autocomplete"
            inputValue={inputValue}
            sx={{ mb: 0, display: 'inline-flex' }}
            // @ts-ignore
            onChange={handleOnChange}
            options={events?.sort((a, b) => -b.groupLabel!.localeCompare(a.groupLabel!))}
            // @ts-ignore
            groupBy={option => (option ? option?.groupLabel : null)}
            getOptionLabel={option =>
                // @ts-ignore
                option ? `${option.groupLabel || ''} | (${option.startHour || ''} - ${option.endHour || ''})` : ''
            }
            // @ts-ignore
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
                onInputChange(newInputValue);
            }}
            renderOption={(props, option) => (
                <Box component="li" sx={{ fontSize: 12 }} {...props}>
                    {/* @ts-ignore */}
                    {format(parse(option.date as string, 'yyyy-MM-dd', new Date()), 'dd-MMMM-yyyy')}({/* @ts-ignore */}
                    {(option?.startHour as string) || ''} - {(option?.endHour as string) || ''})
                </Box>
            )}
            renderInput={params => (
                <TextField {...params} size="small" label={i18n['search']} InputProps={{ ...params.InputProps }} />
            )}
        />
    );
}

export default ToolbarSearchbar;

const StyledAutoComplete = styled(Autocomplete)(({ theme }) => ({
    color: 'inherit',
    width: '94%',
    display: 'inline-flex',
    margin: theme.spacing(0.5, 1.5),
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
        width: '100%',
    },
    [theme.breakpoints.up('md')]: {
        width: '27ch',
    },
    [theme.breakpoints.up('lg')]: {
        width: '27ch',
    },
}));
