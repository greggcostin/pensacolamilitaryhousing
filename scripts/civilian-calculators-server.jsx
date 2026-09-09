import React from 'react';
import {renderToString} from 'react-dom/server';
import {defaultState} from './civilian-calculator-ui.mjs';
import {MilitaryCalculatorPanel} from './civilian-military-calculators.jsx';
export function renderMilitaryPanels(){return Object.fromEntries(['payment','compare','payoff'].map(panel=>[panel,renderToString(<MilitaryCalculatorPanel panel={panel} initialState={defaultState()}/>,{identifierPrefix:'gc-'+panel+'-'})]));}
