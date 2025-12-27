import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  IconButton
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean;
}

interface FilterBarProps {
  filters: FilterConfig[];
  filterValues: Record<string, string | string[]>;
  onFilterChange: (key: string, value: string | string[]) => void;
  onClearFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  filterValues,
  onFilterChange,
  onClearFilters
}) => {

  const handleFilterChange = (key: string, event: SelectChangeEvent<string | string[]>) => {
    const value = event.target.value;
    onFilterChange(key, value);
  };

  const hasActiveFilters = Object.values(filterValues).some(value =>
    Array.isArray(value) ? value.length > 0 : value !== ''
  );

  return (
    <Box sx={{
      display: 'flex',
      gap: { xs: 1, sm: 2 },
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      width: { xs: '100%', sm: 'auto' }
    }}>
      {filters.map((filter) => {
        const currentValue = filterValues[filter.key] || (filter.multiple ? [] : '');

        return (
          <FormControl
            key={filter.key}
            size="small"
            sx={{
              minWidth: { xs: '100%', sm: filter.multiple ? 180 : 140 },
              width: { xs: '100%', sm: 'auto' },
              '& .MuiInputBase-root': {
                fontSize: '0.875rem'
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.8rem'
              }
            }}
          >
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={currentValue}
              label={filter.label}
              onChange={(event) => handleFilterChange(filter.key, event)}
              multiple={filter.multiple}
              renderValue={(selected) => {
                if (filter.multiple && Array.isArray(selected) && selected.length > 0) {
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const option = filter.options.find(opt => opt.value === value);
                        return (
                          <Chip
                            key={value}
                            label={option?.label || value}
                            size="small"
                            sx={{ height: 20, fontSize: '0.75rem' }}
                          />
                        );
                      })}
                    </Box>
                  );
                }
                if (typeof selected === 'string' && selected) {
                  const option = filter.options.find(opt => opt.value === selected);
                  return option?.label || selected;
                }
                return <em>Seleccionar</em>;
              }}
            >
              {filter.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      })}

      {hasActiveFilters && (
        <IconButton
          size="small"
          onClick={onClearFilters}
          sx={{
            ml: 1,
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary'
            }
          }}
          title="Limpiar filtros"
        >
          <ClearIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default FilterBar;
