// Vendor imports for the no-build React app (ES modules from esm.sh).
// Everything imports React/hooks/html from here so there is a single
// React instance shared across the app.
import React from 'https://esm.sh/react@18.3.1';
import * as ReactDOMClient from 'https://esm.sh/react-dom@18.3.1/client?deps=react@18.3.1';
import htm from 'https://esm.sh/htm@3.1.1';

export const html = htm.bind(React.createElement);
export const { useState, useEffect, useRef, useCallback, useMemo, useContext, createContext, Fragment } = React;
export const createRoot = ReactDOMClient.createRoot;
export default React;
