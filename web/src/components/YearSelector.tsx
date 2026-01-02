import React from 'react';
import { FormControl, Select, MenuItem, SelectChangeEvent, Box, Typography } from '@mui/material';
import { useYear } from '../contexts/YearContext';

const YearSelector: React.FC = () => {
    const { selectedYear, setSelectedYear } = useYear();

    const handleChange = (event: SelectChangeEvent<number>) => {
        setSelectedYear(event.target.value as number);
    };

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'inherit' }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600 }}>
                Año:
            </Typography>
            <FormControl size="small" sx={{ m: 1, minWidth: 80 }}>
                <Select
                    value={selectedYear}
                    onChange={handleChange}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Seleccionar Año' }}
                    variant="outlined"
                    sx={{
                        color: 'inherit',
                        '.MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255, 255, 255, 0.8)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'white',
                        },
                        '.MuiSvgIcon-root': {
                            color: 'white',
                        },
                        height: '32px'
                    }}
                >
                    {years.map((year) => (
                        <MenuItem key={year} value={year}>
                            {year}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default YearSelector;
