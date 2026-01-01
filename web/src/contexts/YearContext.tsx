import React, { createContext, useContext, useState } from 'react';

interface YearContextType {
    selectedYear: number;
    setSelectedYear: (year: number) => void;
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export const YearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Inicializar con el año actual o el guardado en localStorage
    const [selectedYear, setSelectedYearState] = useState<number>(() => {
        const savedYear = localStorage.getItem('selectedYear');
        return savedYear ? parseInt(savedYear, 10) : new Date().getFullYear();
    });

    const setSelectedYear = (year: number) => {
        setSelectedYearState(year);
        localStorage.setItem('selectedYear', year.toString());
    };

    return (
        <YearContext.Provider value={{ selectedYear, setSelectedYear }}>
            {children}
        </YearContext.Provider>
    );
};

export const useYear = () => {
    const context = useContext(YearContext);
    if (context === undefined) {
        throw new Error('useYear must be used within a YearProvider');
    }
    return context;
};
