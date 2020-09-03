import './fast-refresh-fix';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { LoadingPage } from './components/loading-page';

export const html = renderToString(<LoadingPage />);
