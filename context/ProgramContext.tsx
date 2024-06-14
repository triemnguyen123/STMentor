// context/ProgramContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Program {
    _id: string;
    ['Mã học phần']: string;
    TenHocPhan: string;
    TC: number;
}

interface ProgramContextProps {
    programs: Program[];
    fetchPrograms: () => Promise<void>;
}

const ProgramContext = createContext<ProgramContextProps>({
    programs: [],
    fetchPrograms: async () => {},
});

export const useProgram = () => useContext(ProgramContext);

interface ProviderProps {
    children: ReactNode;
}

export const ProgramProvider = ({ children }: ProviderProps) => {
    const [programs, setPrograms] = useState<Program[]>([]);

    const fetchPrograms = async () => {
        try {
            const response = await fetch('/api/programs');
            const data = await response.json();
            setPrograms(data);
        } catch (error) {
            console.error('Failed to fetch programs:', error);
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, []);

    return (
        <ProgramContext.Provider value={{ programs, fetchPrograms }}>
            {children}
        </ProgramContext.Provider>
    );
};
