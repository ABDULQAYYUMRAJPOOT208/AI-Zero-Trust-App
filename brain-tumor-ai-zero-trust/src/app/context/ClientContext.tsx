// app/context/ClientContext.tsx
'use client'

import { createContext, useContext, useState } from 'react';

const MyContext = createContext<{ state: string; setState: React.Dispatch<React.SetStateAction<string>> } | undefined>(undefined);

export function MyContextProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState("some state");

  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
}

export function useMyContext() {
  return useContext(MyContext);
}
