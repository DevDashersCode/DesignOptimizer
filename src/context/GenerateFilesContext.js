import { createContext, useState } from 'react';

const initialState = {
  selectedConversion: 'raw',
};

const GenerateFilesContext = createContext(initialState);

export const GenereateFilesProvider = ({ children }) => {
  return (
    <GenerateFilesContext.Provider value={initialState}>
      {children}
    </GenerateFilesContext.Provider>
  );
};

export default GenerateFilesContext;
