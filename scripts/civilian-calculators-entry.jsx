import React from 'react';
import {hydrateRoot} from 'react-dom/client';
import {calculatorBridge} from './civilian-calculator-ui.mjs';
import {MilitaryCalculatorPanel} from './civilian-military-calculators.jsx';
for(const panel of ['payment','compare','payoff']){
 const node=document.getElementById('cal-react-'+panel);
 if(node)hydrateRoot(node,<MilitaryCalculatorPanel panel={panel} bridge={calculatorBridge}/>,{identifierPrefix:'gc-'+panel+'-'});
}
