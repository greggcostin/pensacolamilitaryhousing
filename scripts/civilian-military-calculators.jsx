// Ported from the military site's LoanCalculator, AmortizationAnalyzer and LoanComparison.
// Preserve their forms, result cards, full-width SVG plots and table layout.
import React, {useState,useEffect,useId} from 'react';
import {computeLoanProduct,runAmortSchedule,comparisonPeriod,toMilitaryLoan,fromMilitaryLoan} from './military-calculator-adapter.mjs';
const C={ink:'#0c131f',panel:'#152331',elevated:'#182838',gold:'#d6b96f',goldTint:'rgba(214,185,111,.09)',goldLine:'rgba(214,185,111,.4)',hairline:'#344758',text:'#e1e7ec',muted:'#c2ccd6',mutedD:'#a7b5c3'};
const CHARCOAL='#101c29',SS='var(--sans,Inter,sans-serif)',SF='var(--serif,Georgia,serif)';
const inputStyle={width:'100%',padding:'10px 12px',background:CHARCOAL,border:'1px solid #506274',borderRadius:6,color:'#fff',fontSize:16,fontFamily:SS,boxSizing:'border-box'};
const labelStyle={color:C.muted,fontSize:11,fontWeight:500,letterSpacing:1.5,textTransform:'uppercase',marginBottom:6,display:'block',fontFamily:SS};
const rowStyle={display:'flex',justifyContent:'space-between',gap:12,padding:'10px 0',borderBottom:`1px solid ${C.hairline}`};
const fmt=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number.isFinite(Number(n))?Number(n):0);
const fmt2=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2}).format(Number.isFinite(Number(n))?Number(n):0);
const H2=({children})=><h2 style={{fontFamily:SF,fontSize:'clamp(25px,3vw,36px)',lineHeight:1.2,margin:'8px 0 18px',fontWeight:500,color:'#f3eee4'}}>{children}</h2>;
const Eyebrow=({children})=><div style={{fontFamily:SS,color:C.gold,fontSize:11,fontWeight:700,letterSpacing:2,textTransform:'uppercase',marginBottom:8}}>{children}</div>;
const ErrorMessage=({message})=>message?<p className="cal-error" role="alert">{message}</p>:null;
const SummaryLine=({label,value})=><div style={{...rowStyle,fontSize:13,padding:'6px 0'}}><span style={{color:C.muted}}>{label}</span><strong style={{color:'#fff'}}>{value}</strong></div>;
const loanDescriptions={conv:'Conventional financing with an editable PMI quote. Confirm the down payment and eligibility requirements for your program.',fha:'FHA purchase financing with upfront and annual mortgage insurance. Premiums depend on loan amount, original down payment and term.',va:'For eligible buyers with lender-confirmed entitlement and occupancy. Funding-fee use, exemption and financing are separate choices.'};
function safeProduct(loan){try{return computeLoanProduct(loan);}catch(e){return {...computeLoanProduct({type:'conv',price:1,downPct:100,rate:0,years:30,firstUse:true,vaExempt:false,extra:0}),error:e.message};}}
function safeSchedule(args){try{return runAmortSchedule(args);}catch(e){return {schedule:[],byYear:[],totalInterest:0,totalMonths:0,basePmt:0,error:e.message};}}
function NumberField({label,value,onChange,min=0,max=1e8,step='any'}){const id=useId();return <div><label htmlFor={id} style={labelStyle}>{label}</label><input id={id} type="number" inputMode="decimal" value={Number.isFinite(Number(value))?value:''} min={min} max={max} step={step} onChange={e=>onChange(e.target.value===''?NaN:Number(e.target.value))} style={inputStyle}/></div>;}
function ChartSlider({label,value,max,onChange}){const id=useId();return <div className="gc-chart-control"><label htmlFor={id}>{label}</label><input id={id} type="range" min="0" max={max} step="1" value={value} aria-valuetext={value===0?'Loan start':`Month ${value}`} onChange={e=>onChange(Number(e.target.value))}/><output htmlFor={id}>{value===0?'Loan start':`Month ${value} of ${max}`}</output></div>;}
function ProgramNotes({loan}){const r=safeProduct(loan);return <div className="gc-program-note">{loan.type==='conv'?<><strong>{Number(loan.downPct)>=20?'No modeled monthly PMI':'Conventional mortgage insurance'}</strong><p>{Number(loan.downPct)>=20?'At 20% down or more, this model has no borrower-paid monthly PMI.':'Use the lender\'s PMI quote. Automatic termination follows the original schedule with current payments; extra principal does not assume earlier approved cancellation.'}</p></>:loan.type==='fha'?<><strong>FHA mortgage insurance</strong><p>Upfront MIP is 1.75% of the base loan. {r.error?'Enter valid loan figures to see annual MIP.':`Annual MIP for these inputs: ${r.fha.annualPercent.toFixed(2)}%, modeled for ${r.fha.duration/12} years or earlier payoff. Monthly premiums decline with the scheduled balance.`}</p></>:<><strong>VA financing for eligible buyers</strong><p>No monthly mortgage insurance. Confirm the funding-fee exemption and eligibility with your lender.</p></>}</div>;}
function PropertyAndClosingFields({loan,setLoan}){const set=(key,value)=>setLoan({...loan,[key]:value});return <details className="gc-details"><summary>Property costs, mortgage insurance and closing cash</summary><div className="gc-field-grid">{[['tax','Property taxes per year'],['insurance','Homeowners / wind insurance per year'],['flood','Separate flood insurance per year'],['hoa','HOA / condo dues per month'],['pmi','Annual PMI quote %'],['lenderFees','Lender fees, excluding points'],['points','Discount points %'],['otherClosing','Other closing costs'],['prepaid','Prepaid expenses'],['escrow','Initial escrow deposit'],['credits','Eligible seller / lender credits'],['deposit','Earnest money already paid'],['reserves','Cash reserve to retain'],['moving','Moving / immediate work']].filter(([key])=>key!=='pmi'||loan.type==='conv').map(([key,label])=><NumberField key={key} label={label} value={loan[key]??0} max={key==='pmi'?5:key==='points'?10:1e8} onChange={v=>set(key,v)}/>)}</div>{loan.type!=='conv'&&<label style={labelStyle}>Upfront program fee<select aria-label="Upfront program fee" style={inputStyle} value={loan.financeFee||'yes'} onChange={e=>set('financeFee',e.target.value)}><option value="yes">Finance the fee</option><option value="no">Pay the fee at closing</option></select></label>}<p className="cal-help">Enter property-specific costs and written lender quotes. Keep fees, points, prepaids and escrow separate. Credits and the deposit reduce closing cash; retained reserves stay in the broader cash plan.</p></details>;}
function PaymentBreakdown({result:r}){const parts=[['Principal & interest',r.basePmt,C.gold],['Property taxes',r.input.tax/12,'#8fbccc'],['Homeowners / wind insurance',r.input.insurance/12,'#b3b4d8'],['Separate flood insurance',r.input.flood/12,'#81b8a6'],['Mortgage insurance',r.miMonthly,'#d6a189'],['HOA / condo dues',r.input.hoa,'#a0aab9']];return <div className="gc-payment-breakdown"><div className="gc-payment-stack" aria-hidden="true">{parts.map(([label,value,color])=><span key={label} title={`${label}: ${fmt2(value)}`} style={{width:`${r.totalMonthly?value/r.totalMonthly*100:0}%`,background:color}}/>)}</div>{parts.map(([label,value,color])=><div className="gc-payment-part" key={label}><div style={{...rowStyle,border:0,padding:'8px 0 5px',fontSize:13}}><span><i style={{background:color}}/>{label}</span><strong>{fmt2(value)}</strong></div><div className="gc-payment-track" aria-hidden="true"><span style={{width:`${r.totalMonthly?value/r.totalMonthly*100:0}%`,background:color}}/></div></div>)}<details className="gc-details"><summary>Principal and interest in payment 1</summary><SummaryLine label="Principal repaid" value={fmt2(r.sched.schedule[0]?.principal||0)}/><SummaryLine label="Interest charged" value={fmt2(r.sched.schedule[0]?.interest||0)}/></details><p className="cal-help">The bars show each cost's share of the total. Costs may be paid to different parties. Maintenance, utilities and special assessments are additional.</p></div>;}

const AmortizationAnalyzer = ({ principal, annualRate, years, basePayment, extras, setExtras }) => {
  const [hover, setHover] = useState(null);
  const {freq='monthly',monthly:extraMonthly=0,annual:extraAnnual=0,customAmt=0,customFreq='onetime',customStart=12}=extras;
  const setFreq=v=>setExtras({...extras,freq:v}),setExtraMonthly=v=>setExtras({...extras,monthly:v===''?NaN:Number(v)}),setExtraAnnual=v=>setExtras({...extras,annual:v===''?NaN:Number(v)}),setCustomAmt=v=>setExtras({...extras,customAmt:v===''?NaN:Number(v),lump:0}),setCustomFreq=v=>setExtras({...extras,customFreq:v}),setCustomStart=v=>setExtras({...extras,customStart:v===''?NaN:Number(v)});
  useEffect(()=>setHover(null),[principal,annualRate,years,freq,extraMonthly,extraAnnual,customAmt,customFreq,customStart]);

  const P = Number(principal) || 0;
  const R = Number(annualRate) / 100;
  const N = Math.round(Number(years) * 12);
  const mRate = R / 12;
  const basePmt = basePayment;

  const baseline = safeSchedule({ P, mRate, N, basePmt, extras: { monthly: 0, annual: 0, customAmt: 0, customFreq: "onetime", customStart: 1, freq: "monthly" } });
  const accelerated = safeSchedule({ P, mRate, N, basePmt, extras: { monthly: Number(extraMonthly), annual: Number(extraAnnual), customAmt, customFreq, customStart, freq } });

  const interestSaved = Math.max(0, baseline.totalInterest - accelerated.totalInterest);
  const monthsSaved = Math.max(0, baseline.totalMonths - accelerated.totalMonths);
  const yrsSaved = Math.floor(monthsSaved / 12);
  const moSaved = monthsSaved % 12;
  const baselineRatio = P > 0 ? (baseline.totalInterest / P) * 100 : 0;
  const accelRatio = P > 0 ? (accelerated.totalInterest / P) * 100 : 0;

  const fmt = (n) => "$" + Math.round(Number(n || 0)).toLocaleString("en-US");

  // SVG chart of balance over time (baseline vs. accelerated)
  const chartW = 720, chartH = 300, padL = 56, padR = 16, padT = 16, padB = 36;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const maxMonth = Math.max(baseline.totalMonths, accelerated.totalMonths, 1);
  const maxBal = P || 1;
  const scaleX = (m) => padL + (m / maxMonth) * plotW;
  const scaleY = (b) => padT + plotH - (b / maxBal) * plotH;
  const ptsBase = [[0,P],...baseline.schedule.map(r=>[r.month,r.balance])];
  const ptsAccel = [[0,P],...accelerated.schedule.map(r=>[r.month,r.balance])];
  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p[0]).toFixed(1)} ${scaleY(p[1]).toFixed(1)}`).join(" ");

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: scaleY(t * maxBal), val: fmt(t * maxBal) }));
  // X-axis ticks (every 5 years or so)
  const maxYears = Math.ceil(maxMonth / 12);
  const tickStep = maxYears > 20 ? 5 : (maxYears > 10 ? 2 : 1);
  const xTicks = [];
  for (let y = 0; y <= maxYears; y += tickStep) {
    xTicks.push({ x: scaleX(y * 12), label: y + "y" });
  }

  const inspectMonth=rawMonth=>{              const snapped = Math.max(0, Math.min(maxMonth, Math.round(rawMonth)));
              const year = Math.ceil(snapped / 12);
              const monthOfYear = ((snapped - 1) % 12) + 1;
              const quarter = Math.ceil(monthOfYear / 3);
              const baseBal = snapped===0 ? P : baseline.schedule[snapped-1]?.balance || 0;
              const accelBal = snapped===0 ? P : accelerated.schedule[snapped-1]?.balance || 0;
              const baseInt = baseline.schedule.slice(0, snapped).reduce((s, r) => s + r.interest, 0);
              const accelInt = accelerated.schedule.slice(0, snapped).reduce((s, r) => s + r.interest, 0);
              setHover({ month: snapped, year, quarter, baseBal, accelBal, baseInt, accelInt });
  };
  const inputStyle = { width: "100%", padding: "10px 12px", background: CHARCOAL, border: "1px solid #444", borderRadius: 6, color: "#fff", fontSize: 16, outline: "none", fontFamily: SS, boxSizing: "border-box" };
  const labelStyle = { color: C.muted, fontSize: 11, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, display: "block", fontFamily: SS };
  const card = { background: C.panel, border: `1px solid ${C.hairline}`, borderRadius: 10, padding: 20 };

  return (
    <div className="gc-military-calculator gc-payoff" data-component="AmortizationAnalyzer">
      <div>
        <Eyebrow>Amortization & Payoff Analyzer</Eyebrow>
        <H2>Run the Numbers on Extra Payments</H2>
        <p style={{ color: C.muted, fontSize: 15.5, lineHeight: 1.75, marginBottom: 32 }}>
          Extra principal reduces the balance on which future interest is charged. Model different payment frequencies and extra-payment strategies below. This uses the <strong style={{ color: C.gold }}>same loan amount, interest rate, and term</strong> from Monthly payment. Everything updates live.
        </p>

        <div className="amort-input-row" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 24 }}>
          <div style={card}>
            <label style={labelStyle}>Payment Frequency</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[["monthly", "Monthly"], ["biweekly", "Bi-weekly"], ["weekly", "Weekly"]].map(([id, lbl]) => (
                <button key={id} aria-pressed={freq===id} onClick={() => setFreq(id)} style={{ flex: 1, minWidth: 80, padding: "8px 10px", background: freq === id ? C.gold : "transparent", color: freq === id ? C.ink : C.muted, border: `1px solid ${freq === id ? C.gold : "#444"}`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SS, letterSpacing: 1, textTransform: "uppercase" }}>{lbl}</button>
              ))}
            </div>
            <p style={{ color: C.mutedD, fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>26 half-payments or 52 quarter-payments equal 13 monthly payments per year. Modeled as equivalent extra principal each month.</p>
          </div>
          <div style={card}>
            <label style={labelStyle}>Extra Monthly Payment ($)</label>
            <input type="number" aria-label="Extra monthly payment in dollars" value={Number.isNaN(Number(extraMonthly))?'':extraMonthly} onChange={e => setExtraMonthly(e.target.value)} style={inputStyle} min="0" />
            <p style={{ color: C.mutedD, fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>Added to every monthly principal payment.</p>
          </div>
          <div style={card}>
            <label style={labelStyle}>Annual Lump Sum ($)</label>
            <input type="number" aria-label="Annual lump sum in dollars" value={Number.isNaN(Number(extraAnnual))?'':extraAnnual} onChange={e => setExtraAnnual(e.target.value)} style={inputStyle} min="0" />
            <p style={{ color: C.mutedD, fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>Applied at the end of each loan year, starting in month 12.</p>
          </div>
          <div style={card}>
            <label style={labelStyle}>Custom Extra Payment ($)</label>
            <input type="number" aria-label="Custom extra payment in dollars" value={Number.isNaN(Number(customAmt))?'':customAmt} onChange={e => setCustomAmt(e.target.value)} style={inputStyle} min="0" placeholder="0" />
            <label style={{ ...labelStyle, fontSize: 10, marginTop: 10 }}>Frequency</label>
            <select aria-label="Custom payment frequency" value={customFreq} onChange={e => setCustomFreq(e.target.value)} style={inputStyle}>
              <option value="onetime">One-Time</option>
              <option value="weekly">Every Week</option>
              <option value="monthly">Every Month</option>
              <option value="quarterly">Every Quarter</option>
              <option value="annual">Every Year</option>
            </select>
            <label style={{ ...labelStyle, fontSize: 10, marginTop: 10 }}>{customFreq === "onetime" ? "Applied at month #" : "Starting at month #"}</label>
            <input type="number" aria-label="Custom payment start month" value={Number.isNaN(Number(customStart))?'':customStart} onChange={e => setCustomStart(e.target.value)} style={inputStyle} min="1" />
          </div>
        </div>

        <ErrorMessage message={accelerated.error}/><div hidden={!!accelerated.error}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 32 }}>
          <div style={{ ...card, borderColor: C.goldLine, background: `linear-gradient(135deg, ${C.goldTint}, transparent)` }}>
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Interest Saved</div>
            <div style={{ color: C.gold, fontSize: 28, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{fmt(interestSaved)}</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>vs. baseline {years}-year schedule</div>
          </div>
          <div style={card}>
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Time Saved</div>
            <div style={{ color: "#fff", fontSize: 24, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{yrsSaved} yr {moSaved} mo</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>Paid off in {Math.floor(accelerated.totalMonths/12)} yr {accelerated.totalMonths%12} mo</div>
          </div>
          <div style={card}>
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Nominal Rate</div>
            <div style={{ color: "#fff", fontSize: 24, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{annualRate}%</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>Your contract rate (unchanged)</div>
          </div>
          <div style={card}>
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Interest / Loan Amount</div>
            <div style={{ color: "#fff", fontSize: 24, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{accelRatio.toFixed(1)}%</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>of principal paid as interest (vs. {baselineRatio.toFixed(1)}% baseline)</div>
          </div>
        </div>

        <div style={card}>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: SF, marginBottom: 14 }}>Balance Over Time</div>
          <div style={{ display: "flex", gap: 18, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 24, height: 2, background: "#8aa4b9", display: "inline-block" }}/><span style={{ color: C.muted, fontSize: 12 }}>Baseline ({years} yr)</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 24, height: 2, background: C.gold, display: "inline-block" }}/><span style={{ color: C.muted, fontSize: 12 }}>Accelerated</span></div>
          </div>
          <div style={{ position: "relative" }}>
          <svg role="img" aria-label="Baseline and accelerated loan balances" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" style={{ width: "100%", height: "auto", display: "block" }}
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = ((e.clientX - rect.left) / rect.width) * chartW;
              if (relX < padL || relX > chartW - padR) { setHover(null); return; }
              const rawMonth = Math.round(((relX - padL) / plotW) * maxMonth);
              inspectMonth(rawMonth);
            }}
            onPointerLeave={() => setHover(null)}>
            {yTicks.map((t, i) => (
              <g key={"y"+i}>
                <line x1={padL} y1={t.y} x2={chartW-padR} y2={t.y} stroke={C.hairline} strokeDasharray="2 4" />
                <text x={padL-8} y={t.y+4} textAnchor="end" fill={C.mutedD} fontSize="11" fontFamily="Inter,sans-serif">{t.val}</text>
              </g>
            ))}
            {xTicks.map((t, i) => (
              <text key={"x"+i} x={t.x} y={chartH-12} textAnchor="middle" fill={C.mutedD} fontSize="11" fontFamily="Inter,sans-serif">{t.label}</text>
            ))}
            <path d={toPath(ptsBase)} fill="none" stroke="#8aa4b9" strokeWidth="2" />
            <path d={toPath(ptsAccel)} fill="none" stroke={C.gold} strokeWidth="2.5" />
            {hover && (
              <g>
                <line x1={scaleX(hover.month)} y1={padT} x2={scaleX(hover.month)} y2={chartH-padB} stroke={C.gold} strokeDasharray="3 3" opacity="0.55" />
                <circle cx={scaleX(hover.month)} cy={scaleY(hover.baseBal)} r="5" fill="#8aa4b9" stroke="#fff" strokeWidth="1.5"/>
                <circle cx={scaleX(hover.month)} cy={scaleY(hover.accelBal)} r="5" fill={C.gold} stroke="#fff" strokeWidth="1.5"/>
              </g>
            )}
          </svg><ChartSlider label="Inspect payoff month" max={maxMonth} value={hover?.month||0} onChange={inspectMonth}/>
          {hover && (
            <div className="gc-chart-tooltip" style={{ position: "absolute", top: 8, right: 8, background: C.ink, border: `1px solid ${C.goldLine}`, borderRadius: 8, padding: "12px 16px", fontSize: 12, lineHeight: 1.6, pointerEvents: "none", minWidth: 200, boxShadow: "0 6px 18px rgba(0,0,0,0.5)" }}>
              <div style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>{hover.month===0 ? "Loan start" : `Year ${hover.year} · Q${hover.quarter}`}</div>
              <div style={{ color: C.muted, fontSize: 11, marginBottom: 8 }}>Month {hover.month}</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "4px 0" }}>
                <span style={{ color: "#a9bdcf" }}>Baseline balance</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(hover.baseBal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "4px 0" }}>
                <span style={{ color: C.gold }}>Accelerated balance</span>
                <span style={{ color: C.gold, fontWeight: 700 }}>{fmt(hover.accelBal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "4px 0", borderTop: `1px solid ${C.hairline}`, marginTop: 4 }}>
                <span style={{ color: C.mutedD, fontSize: 11 }}>Interest paid so far</span>
                <span style={{ color: "#fff", fontSize: 11 }}>{fmt(hover.accelInt)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "2px 0" }}>
                <span style={{ color: C.mutedD, fontSize: 11 }}>Saved vs baseline</span>
                <span style={{ color: C.gold, fontSize: 11, fontWeight: 700 }}>{fmt(Math.max(0, hover.baseInt - hover.accelInt))}</span>
              </div>
            </div>
          )}
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: SF, marginBottom: 14 }}>Annual Breakdown (Accelerated Schedule)</div>
          <div style={{ overflowX: "auto", border: `1px solid ${C.hairline}`, borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 540 }}>
              <thead>
                <tr style={{ background: C.ink }}>
                  <th style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "left", borderBottom: `1px solid ${C.goldLine}` }}>Year</th>
                  <th style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "right", borderBottom: `1px solid ${C.goldLine}` }}>Principal</th>
                  <th style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "right", borderBottom: `1px solid ${C.goldLine}` }}>Interest</th>
                  <th style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "right", borderBottom: `1px solid ${C.goldLine}` }}>Ending Balance</th>
                </tr>
              </thead>
              <tbody>
                {accelerated.byYear.map((r, i) => (
                  <tr key={r.year} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                    <td style={{ color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 14px", borderBottom: `1px solid ${C.hairline}` }}>Year {r.year}</td>
                    <td style={{ color: C.gold, fontSize: 14, fontWeight: 600, padding: "10px 14px", textAlign: "right", borderBottom: `1px solid ${C.hairline}` }}>{fmt(r.principal)}</td>
                    <td style={{ color: C.text, fontSize: 14, padding: "10px 14px", textAlign: "right", borderBottom: `1px solid ${C.hairline}` }}>{fmt(r.interest)}</td>
                    <td style={{ color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 14px", textAlign: "right", borderBottom: `1px solid ${C.hairline}` }}>{fmt(r.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: C.mutedD, fontSize: 12, fontStyle: "italic", marginTop: 12, lineHeight: 1.6 }}>
            <strong>How to read this:</strong> "Interest / Loan Amount" is total interest divided by the original amount borrowed. It is a lifetime ratio, not APR or an annual interest rate. Weekly amounts use a monthly equivalent; the servicer's actual posting dates may change savings. Confirm how extra principal and partial payments are applied.
          </p><p className="cal-help">Principal includes every extra payment. The final year can contain fewer than 12 payments; download the monthly schedule for the exact payoff month.</p>
        </div>
        <button className="cal-button cal-button--subtle" data-export="amortization">Download the full monthly schedule (CSV)</button></div>
      </div>
    </div>
  );
};


const LoanComparison = ({a,b,setA,setB,horizon,setHorizon}) => {
  const periodInvalid=!Number.isInteger(Number(horizon))||Number(horizon)<1||Number(horizon)>30;
  const [compareHover, setCompareHover] = useState(null);

  const rA = safeProduct(a);
  const rB = safeProduct(b);
  const fmt = (n) => "$" + Math.round(Number(n || 0)).toLocaleString("en-US");

  const totalMonthlyA = rA.plannedMonthly;
  const totalMonthlyB = rB.plannedMonthly;
  const ratioA = rA.totalLoan > 0 ? (rA.sched.totalInterest / rA.totalLoan) * 100 : 0;
  const ratioB = rB.totalLoan > 0 ? (rB.sched.totalInterest / rB.totalLoan) * 100 : 0;
  const intDelta = Math.abs(rA.sched.totalInterest - rB.sched.totalInterest);
  const winnerInt = rA.sched.totalInterest < rB.sched.totalInterest ? "A" : "B";
  const pmtDelta = Math.abs(totalMonthlyA - totalMonthlyB);
  const winnerPmt = totalMonthlyA < totalMonthlyB ? "A" : "B";
  const outOfPocketA = rA.cashToClose;
  const outOfPocketB = rB.cashToClose;
  const totalCostOfBorrowA = rA.totalBorrowingCost;
  const totalCostOfBorrowB = rB.totalBorrowingCost;

  const chartW = 720, chartH = 260, padL = 56, padR = 16, padT = 16, padB = 32;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const maxMonth = Math.max(rA.sched.totalMonths, rB.sched.totalMonths, 1);
  const maxBal = Math.max(rA.totalLoan || 0, rB.totalLoan || 0, 1);
  const scaleX = (m) => padL + (m / maxMonth) * plotW;
  const scaleY = (v) => padT + plotH - (v / maxBal) * plotH;
  const pointsOf = (r) => {
    const pts = [[0, r.totalLoan]];
    r.sched.schedule.forEach(row => pts.push([row.month, row.balance]));
    if (pts[pts.length - 1][1] > 0.01) pts.push([r.sched.totalMonths, 0]);
    return pts;
  };
  const pathOf = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p[0]).toFixed(1)} ${scaleY(p[1]).toFixed(1)}`).join(" ");
  const ptsA = pointsOf(rA);
  const ptsB = pointsOf(rB);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({ y: scaleY(t * maxBal), val: fmt(t * maxBal) }));
  const maxYears = Math.ceil(maxMonth / 12);
  const tickStep = maxYears > 20 ? 5 : (maxYears > 10 ? 2 : 1);
  const xTicks = [];
  for (let y = 0; y <= maxYears; y += tickStep) xTicks.push({ x: scaleX(y * 12), label: y + "y" });

  const inspectMonth=rawMonth=>{              const snapped = Math.max(0, Math.min(maxMonth, Math.round(rawMonth)));
              const year = Math.ceil(snapped / 12);
              const monthOfYear = ((snapped - 1) % 12) + 1;
              const quarter = Math.ceil(monthOfYear / 3);
              const aBal = snapped===0 ? rA.totalLoan : rA.sched.schedule[snapped-1]?.balance || 0;
              const bBal = snapped===0 ? rB.totalLoan : rB.sched.schedule[snapped-1]?.balance || 0;
              const aInt = rA.sched.schedule.slice(0, snapped).reduce((s, r) => s + r.interest, 0);
              const bInt = rB.sched.schedule.slice(0, snapped).reduce((s, r) => s + r.interest, 0);
              setCompareHover({ month: snapped, year, quarter, aBal, bBal, aInt, bInt });
  };
  useEffect(()=>setCompareHover(null),[a,b]);
  const inputStyle = { width: "100%", padding: "10px 12px", background: CHARCOAL, border: "1px solid #444", borderRadius: 6, color: "#fff", fontSize: 16, outline: "none", fontFamily: SS, boxSizing: "border-box" };
  const labelStyle = { color: C.muted, fontSize: 11, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, display: "block", fontFamily: SS };
  const card = { background: C.panel, border: `1px solid ${C.hairline}`, borderRadius: 10, padding: 20 };

  const typeDesc = loanDescriptions;

  const LoanForm = ({ loan, setLoan, color }) => (
    <div role="group" aria-label={loan.label} style={{ ...card, borderColor: color, borderWidth: 2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ width: 12, height: 12, borderRadius: 12, background: color, display: "inline-block", flexShrink: 0 }} />
        <input aria-label="Loan name" value={loan.label} onChange={e => setLoan({ ...loan, label: e.target.value })} style={{ ...inputStyle, fontWeight: 700, fontSize: 16, padding: "8px 10px" }} />
      </div>
      <label style={labelStyle}>Loan Product</label>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[["conv","Conventional"],["fha","FHA"],["va","VA"]].map(([id,lbl]) => (
          <button key={id} aria-pressed={loan.type === id} onClick={() => {
            setLoan({...loan,type:id,downPct:Math.max(Number(loan.downPct)||0,id==='fha'?3.5:id==='conv'?3:0)});
          }} style={{ flex: 1, padding: "8px 10px", background: loan.type === id ? color : "transparent", color: loan.type === id ? C.ink : C.muted, border: `1px solid ${loan.type === id ? color : "#444"}`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: SS, letterSpacing: 1, textTransform: "uppercase" }}>{lbl}</button>
        ))}
      </div>
      <p style={{ color: C.mutedD, fontSize: 11, lineHeight: 1.55, marginBottom: 14 }}>{typeDesc[loan.type]}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><label style={labelStyle}>Home Price ($)</label><input type="number" aria-label="Home price in dollars" value={Number.isNaN(Number(loan.price))?'':loan.price} onChange={e => setLoan({ ...loan, price: e.target.value })} style={inputStyle} /></div>
        <div><label style={labelStyle}>Rate (%)</label><input type="number" step="0.125" aria-label="Interest rate percent" value={Number.isNaN(Number(loan.rate))?'':loan.rate} onChange={e => setLoan({ ...loan, rate: e.target.value })} style={inputStyle} /></div>
        <div><label style={labelStyle}>Term (Years)</label><input type="number" aria-label="Loan term in years" value={Number.isNaN(Number(loan.years))?'':loan.years} onChange={e => setLoan({ ...loan, years: e.target.value })} style={inputStyle} /></div>
        <div><label style={labelStyle}>Extra Monthly ($)</label><input type="number" aria-label="Extra monthly payment in dollars" value={Number.isNaN(Number(loan.extra))?'':loan.extra} onChange={e => setLoan({ ...loan, extra: e.target.value })} style={inputStyle} /></div>
      </div>
      <div style={{ marginTop: 14 }}>
        <label style={labelStyle}>Down Payment</label>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          {(loan.type === "va" ? [0, 5, 10] : loan.type === "fha" ? [3.5, 5, 10, 20] : [5, 10, 20]).map(dp => (
            <button key={dp} aria-pressed={Number(loan.downPct) === dp} onClick={() => setLoan({ ...loan, downPct: dp })} style={{ flex: "1 1 60px", padding: "6px 8px", background: Number(loan.downPct) === dp ? color : "transparent", color: Number(loan.downPct) === dp ? C.ink : C.muted, border: `1px solid ${Number(loan.downPct) === dp ? color : "#444"}`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: SS, letterSpacing: 1 }}>{dp}%</button>
          ))}
          <input type="number" step="0.1" aria-label="Custom down payment percent" value={Number.isNaN(Number(loan.downPct))?'':loan.downPct} onChange={e => setLoan({ ...loan, downPct: e.target.value })} style={{ ...inputStyle, flex: "1 1 70px", maxWidth: 90, padding: "6px 8px", fontSize: 16 }} placeholder="Custom" />
        </div>
      </div>
      {loan.type === "va" && (
        <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(201,168,76,0.08)", border: `1px solid ${C.goldLine}`, borderRadius: 6, fontSize: 12, color: C.muted }}>
          <div style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>VA Funding Fee: {loan.vaExempt ? "0% (exempt)" : (Number(loan.downPct) < 5 ? (loan.firstUse ? "2.15%" : "3.3%") : Number(loan.downPct) < 10 ? "1.5%" : "1.25%") + (loan.firstUse ? " (first use)" : " (subsequent use)")}</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 4 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={loan.firstUse} onChange={e => setLoan({ ...loan, firstUse: e.target.checked })} /> First-time VA use
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={loan.vaExempt} onChange={e => setLoan({ ...loan, vaExempt: e.target.checked })} /> Lender-confirmed funding-fee exemption
            </label>
          </div>
          <div style={{ marginTop: 6, color: C.muted, fontSize: 11 }}>No monthly PMI: VA loans never require mortgage insurance.</div>
        </div>
      )}
      <ProgramNotes loan={loan}/><PropertyAndClosingFields loan={loan} setLoan={setLoan}/>
      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", padding: "8px 12px", background: C.ink, borderRadius: 6, fontSize: 12 }}>
        <span style={{ color: C.muted }}>Base loan (price − down)</span>
        <span style={{ color: "#fff", fontWeight: 700 }}>{fmt((Number(loan.price)||0) - (Number(loan.price)||0)*(Number(loan.downPct)||0)/100)}</span>
      </div>
    </div>
  );

  const ResultSummary = ({ r, loan, color }) => (
    <div style={{ ...card, borderColor: color }}>
      <div style={{ color, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>{loan.label}</div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
        <span style={{ color: C.muted }}>Down payment ({loan.downPct}%)</span>
        <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(r.downPayment)}</span>
      </div>
      {r.upfrontFee > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
          <span style={{ color: C.muted }}>{r.upfrontLabel}</span>
          <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(r.upfrontFee)}</span>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, borderTop: `1px solid ${C.hairline}`, marginTop: 6 }}>
        <span style={{ color: C.muted }}>Financed total</span>
        <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(r.totalLoan)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
        <span style={{ color: C.muted }}>Monthly P&amp;I</span>
        <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(r.basePmt)}</span>
      </div>
      {r.miMonthly > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
          <span style={{ color: C.muted }}>{r.miLabel}</span>
          <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(r.miMonthly)}/mo</span>
        </div>
      )}
      <SummaryLine label="Taxes, homeowners and flood insurance" value={fmt((r.input.tax+r.input.insurance+r.input.flood)/12)}/><SummaryLine label="HOA / condo dues" value={fmt(r.input.hoa)}/>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 15, borderTop: `1px solid ${C.goldLine}`, marginTop: 8, fontWeight: 700 }}>
        <span style={{ color: color }}>Full monthly housing</span>
        <span style={{ color: color }}>{fmt(r.totalMonthly)}</span>
      </div>
      <SummaryLine label="Extra monthly principal" value={fmt(Number(loan.extra)||0)}/><SummaryLine label="Planned monthly cash outlay" value={fmt(r.plannedMonthly)}/><SummaryLine label="Cash still due at closing" value={fmt(r.cashToClose)}/>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12 }}>
        <span style={{ color: C.mutedD }}>Total interest paid</span>
        <span style={{ color: "#fff" }}>{fmt(r.sched.totalInterest)}</span>
      </div>
      {r.totalMI > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12 }}>
          <span style={{ color: C.mutedD }}>Total MI/PMI paid</span>
          <span style={{ color: "#fff" }}>{fmt(r.totalMI)}{r.pmiMonths > 0 ? ` (${r.pmiMonths} months modeled)` : ""}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="gc-military-calculator gc-loan-comparison" data-component="LoanComparison">
      <div>
        <Eyebrow>Side-by-Side Loan Comparison</Eyebrow>
        <H2>Compare Two Loans Head-to-Head</H2>
        <p style={{ color: C.muted, fontSize: 15.5, lineHeight: 1.75, marginBottom: 28 }}>
          Pit two scenarios against each other (different loan amounts, rates, terms, or extra-payment strategies) and see which one saves you more in monthly cash flow, lifetime interest, and total borrowing cost.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: 16, marginBottom: 24 }}>
          {LoanForm({ loan: a, setLoan: setA, color: C.gold })}
          {LoanForm({ loan: b, setLoan: setB, color: "#8aa4b9" })}
        </div>

        <div className="gc-horizon"><label>Expected ownership period <input type="number" aria-label="Expected ownership period in years" min="1" max="30" step="1" value={Number.isNaN(Number(horizon))?'':horizon} onChange={e=>setHorizon(e.target.value)} style={inputStyle}/></label><button type="button" className="cal-button cal-button--subtle" onClick={()=>setB({...a,label:b.label})}>Copy Loan A into Loan B</button></div><ErrorMessage message={rA.error||rB.error||(!Number.isInteger(Number(horizon))||Number(horizon)<1||Number(horizon)>30?'Ownership period must be 1 to 30 whole years.':'')}/><div hidden={!!(rA.error||rB.error||periodInvalid)}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))", gap: 16, marginBottom: 24 }}>
          {ResultSummary({ r: rA, loan: a, color: C.gold })}
          {ResultSummary({ r: rB, loan: b, color: "#8aa4b9" })}
        </div>

        <div className="amort-input-row" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 28 }}>
          <div style={card}>
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Monthly Outlay Difference</div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{fmt(pmtDelta)}/mo</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>{pmtDelta < .005 ? "Both plans have the same monthly cash outlay." : `${winnerPmt === "A" ? a.label : b.label} has ${fmt(pmtDelta)} lower monthly outlay.`}</div>
          </div>
          <div style={{ ...card, borderColor: C.goldLine, background: `linear-gradient(135deg, ${C.goldTint}, transparent)` }}>
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Lifetime Interest Delta</div>
            <div style={{ color: C.gold, fontSize: 26, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{fmt(intDelta)}</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>{intDelta < .005 ? "Both plans have the same lifetime interest." : `${winnerInt === "A" ? a.label : b.label} pays ${fmt(intDelta)} less lifetime interest.`}</div>
          </div>
          <div style={card}>
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Interest / Loan Amount (A)</div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{ratioA.toFixed(1)}%</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>of financed total paid as interest</div>
          </div>
          <div style={card}>
            <div style={{ color: C.mutedD, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Interest / Loan Amount (B)</div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 600, fontFamily: SF, lineHeight: 1 }}>{ratioB.toFixed(1)}%</div>
            <div style={{ color: C.mutedD, fontSize: 11, marginTop: 6 }}>of financed total paid as interest</div>
          </div>
        </div>

        <div style={card}>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: SF, marginBottom: 14 }}>Balance Over Time: Both Loans</div>
          <div style={{ display: "flex", gap: 18, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 24, height: 2, background: C.gold, display: "inline-block" }}/><span style={{ color: C.muted, fontSize: 12 }}>{a.label}</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 24, height: 2, background: "#8aa4b9", display: "inline-block" }}/><span style={{ color: C.muted, fontSize: 12 }}>{b.label}</span></div>
          </div>
          <div style={{ position: "relative" }}>
          <svg role="img" aria-label="Loan A and Loan B balances over time" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" style={{ width: "100%", height: "auto", display: "block" }}
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const relX = ((e.clientX - rect.left) / rect.width) * chartW;
              if (relX < padL || relX > chartW - padR) { setCompareHover(null); return; }
              const rawMonth = Math.round(((relX - padL) / plotW) * maxMonth);
              inspectMonth(rawMonth);
            }}
            onPointerLeave={() => setCompareHover(null)}>
            {yTicks.map((t, i) => (
              <g key={"y"+i}>
                <line x1={padL} y1={t.y} x2={chartW-padR} y2={t.y} stroke={C.hairline} strokeDasharray="2 4" />
                <text x={padL-8} y={t.y+4} textAnchor="end" fill={C.mutedD} fontSize="11" fontFamily="Inter,sans-serif">{t.val}</text>
              </g>
            ))}
            {xTicks.map((t, i) => (
              <text key={"x"+i} x={t.x} y={chartH-12} textAnchor="middle" fill={C.mutedD} fontSize="11" fontFamily="Inter,sans-serif">{t.label}</text>
            ))}
            <path d={pathOf(ptsB)} fill="none" stroke="#8aa4b9" strokeWidth="2" />
            <path d={pathOf(ptsA)} fill="none" stroke={C.gold} strokeWidth="2.5" />
            {compareHover && (
              <g>
                <line x1={scaleX(compareHover.month)} y1={padT} x2={scaleX(compareHover.month)} y2={chartH-padB} stroke={C.gold} strokeDasharray="3 3" opacity="0.55" />
                <circle cx={scaleX(compareHover.month)} cy={scaleY(compareHover.bBal)} r="5" fill="#8aa4b9" stroke="#fff" strokeWidth="1.5"/>
                <circle cx={scaleX(compareHover.month)} cy={scaleY(compareHover.aBal)} r="5" fill={C.gold} stroke="#fff" strokeWidth="1.5"/>
              </g>
            )}
          </svg><ChartSlider label="Inspect comparison month" max={maxMonth} value={compareHover?.month||0} onChange={inspectMonth}/>
          {compareHover && (
            <div className="gc-chart-tooltip" style={{ position: "absolute", top: 8, right: 8, background: C.ink, border: `1px solid ${C.goldLine}`, borderRadius: 8, padding: "12px 16px", fontSize: 12, lineHeight: 1.6, pointerEvents: "none", minWidth: 220, boxShadow: "0 6px 18px rgba(0,0,0,0.5)" }}>
              <div style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>{compareHover.month===0 ? "Loan start" : `Year ${compareHover.year} · Q${compareHover.quarter}`}</div>
              <div style={{ color: C.muted, fontSize: 11, marginBottom: 8 }}>Month {compareHover.month}</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "4px 0" }}>
                <span style={{ color: C.gold }}>{a.label.length > 22 ? a.label.slice(0, 22) + "…" : a.label}</span>
                <span style={{ color: C.gold, fontWeight: 700 }}>{fmt(compareHover.aBal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "4px 0" }}>
                <span style={{ color: "#a9bdcf" }}>{b.label.length > 22 ? b.label.slice(0, 22) + "…" : b.label}</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{fmt(compareHover.bBal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "4px 0", borderTop: `1px solid ${C.hairline}`, marginTop: 4 }}>
                <span style={{ color: C.mutedD, fontSize: 11 }}>Balance delta</span>
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>{fmt(Math.abs(compareHover.aBal - compareHover.bBal))}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "2px 0" }}>
                <span style={{ color: C.mutedD, fontSize: 11 }}>Interest paid so far</span>
                <span style={{ color: C.gold, fontSize: 11, fontWeight: 700 }}>A: {fmt(compareHover.aInt)} · B: {fmt(compareHover.bInt)}</span>
              </div>
            </div>
          )}
          </div>
        </div>

        <div style={{ marginTop: 28, overflowX: "auto", border: `1px solid ${C.hairline}`, borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 580 }}>
            <thead>
              <tr style={{ background: C.ink }}>
                <th style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "left", borderBottom: `1px solid ${C.goldLine}` }}>Metric</th>
                <th style={{ color: C.gold, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "right", borderBottom: `1px solid ${C.goldLine}` }}>{a.label}</th>
                <th style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "right", borderBottom: `1px solid ${C.goldLine}` }}>{b.label}</th>
                <th style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", padding: "12px 14px", textAlign: "right", borderBottom: `1px solid ${C.goldLine}` }}>Difference</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Loan Product", { va: "VA", fha: "FHA", conv: "Conventional" }[a.type], { va: "VA", fha: "FHA", conv: "Conventional" }[b.type], a.type === b.type ? "-" : "different"],
                ["Home Price", fmt(a.price), fmt(b.price), fmt(Math.abs((Number(a.price)||0) - (Number(b.price)||0)))],
                ["Down Payment", fmt(rA.downPayment) + " (" + a.downPct + "%)", fmt(rB.downPayment) + " (" + b.downPct + "%)", fmt(Math.abs(rA.downPayment - rB.downPayment))],
                ["Upfront Fee/MIP", rA.upfrontFee > 0 ? `${fmt(rA.upfrontFee)} (${rA.upfrontLabel})` : "-", rB.upfrontFee > 0 ? `${fmt(rB.upfrontFee)} (${rB.upfrontLabel})` : "-", fmt(Math.abs(rA.upfrontFee - rB.upfrontFee))],
                ["Total Financed", fmt(rA.totalLoan), fmt(rB.totalLoan), fmt(Math.abs(rA.totalLoan - rB.totalLoan))],
                ["Nominal Rate", a.rate + "%", b.rate + "%", Math.abs(Number(a.rate) - Number(b.rate)).toFixed(2) + "%"],
                ["Term", a.years + " yr", b.years + " yr", Math.abs(Number(a.years) - Number(b.years)) + " yr"],
                ["Monthly P&I", fmt(rA.basePmt), fmt(rB.basePmt), fmt(Math.abs(rA.basePmt - rB.basePmt))],
                ["Monthly PMI/MIP", rA.miMonthly > 0 ? fmt(rA.miMonthly) : "-", rB.miMonthly > 0 ? fmt(rB.miMonthly) : "-", fmt(Math.abs(rA.miMonthly - rB.miMonthly))],
                ["Full Monthly Housing", fmt(rA.totalMonthly), fmt(rB.totalMonthly), fmt(Math.abs(rA.totalMonthly-rB.totalMonthly))],
                ["Extra Monthly Principal",fmt(Number(a.extra)||0),fmt(Number(b.extra)||0),fmt(Math.abs(Number(a.extra||0)-Number(b.extra||0)))],
                ["Planned Monthly Cash Outlay",fmt(totalMonthlyA),fmt(totalMonthlyB),fmt(pmtDelta)],
                ["Payoff Time", `${Math.floor(rA.sched.totalMonths/12)} yr ${rA.sched.totalMonths%12} mo`, `${Math.floor(rB.sched.totalMonths/12)} yr ${rB.sched.totalMonths%12} mo`, Math.abs(rA.sched.totalMonths - rB.sched.totalMonths) + " mo"],
                ["Total Interest Paid", fmt(rA.sched.totalInterest), fmt(rB.sched.totalInterest), fmt(intDelta)],
                ["Total PMI/MIP Paid", rA.totalMI > 0 ? fmt(rA.totalMI) : "-", rB.totalMI > 0 ? fmt(rB.totalMI) : "-", fmt(Math.abs(rA.totalMI - rB.totalMI))],
                ["Interest / Loan Amount (Int/Financed)", ratioA.toFixed(1) + "%", ratioB.toFixed(1) + "%", Math.abs(ratioA - ratioB).toFixed(1) + "%"],
                ["Total Cost of Borrowing", fmt(totalCostOfBorrowA), fmt(totalCostOfBorrowB), fmt(Math.abs(totalCostOfBorrowA - totalCostOfBorrowB))],
                ["Cash Still Due at Closing", fmt(outOfPocketA), fmt(outOfPocketB), fmt(Math.abs(outOfPocketA - outOfPocketB))],
                [horizon+"-Year Ownership Cost",fmt(comparisonPeriod(rA,Math.max(1,Math.min(30,Math.round(Number(horizon)||1)))).cost),fmt(comparisonPeriod(rB,Math.max(1,Math.min(30,Math.round(Number(horizon)||1)))).cost),fmt(Math.abs(comparisonPeriod(rA,Math.max(1,Math.min(30,Math.round(Number(horizon)||1)))).cost-comparisonPeriod(rB,Math.max(1,Math.min(30,Math.round(Number(horizon)||1)))).cost))],
                ["Balance After "+horizon+" Years",fmt(comparisonPeriod(rA,Math.max(1,Math.min(30,Math.round(Number(horizon)||1)))).balance),fmt(comparisonPeriod(rB,Math.max(1,Math.min(30,Math.round(Number(horizon)||1)))).balance),fmt(Math.abs(comparisonPeriod(rA,Math.max(1,Math.min(30,Math.round(Number(horizon)||1)))).balance-comparisonPeriod(rB,Math.max(1,Math.min(30,Math.round(Number(horizon)||1)))).balance))],
              ].map(([lbl, av, bv, diff], i) => (
                <tr key={lbl} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                  <td style={{ color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 14px", borderBottom: `1px solid ${C.hairline}` }}>{lbl}</td>
                  <td style={{ color: C.gold, fontSize: 14, fontWeight: 600, padding: "10px 14px", textAlign: "right", borderBottom: `1px solid ${C.hairline}` }}>{av}</td>
                  <td style={{ color: C.text, fontSize: 14, padding: "10px 14px", textAlign: "right", borderBottom: `1px solid ${C.hairline}` }}>{bv}</td>
                  <td style={{ color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 14px", textAlign: "right", borderBottom: `1px solid ${C.hairline}` }}>{diff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: C.mutedD, fontSize: 12, fontStyle: "italic", marginTop: 14, lineHeight: 1.6 }}>
          Edit any field above (amount, rate, term, or extra monthly) and everything recalculates live. Useful for comparing VA vs FHA vs Conventional, or different extra-principal plans, or 30-yr vs 15-yr.
        </p><p className="cal-help">Differences are absolute amounts. Interest / Loan Amount is a lifetime ratio, not APR. Cash includes the entered fees, points, prepaids, escrow, credits and deposit. Period ownership cost excludes equity and does not count prepaids or initial escrow twice. No appreciation, resale expenses or tax deductions are assumed.</p></div>
      </div>
    </div>
  );
};


function MonthlyPayment({loan,onChange}){
 const change=(key,value)=>onChange({...loan,[key]:value});
 const display=n=>Number.isFinite(Number(n))?n:'';
 const loanType=loan.type,homePrice=display(loan.price),downPct=display(loan.downPct),termYears=display(loan.years),rate=display(loan.rate),taxRate=Number.isFinite(loan.tax/loan.price)?Number((loan.tax/loan.price*100).toFixed(4)):'',insuranceAnnual=display(loan.insurance),hoaMonthly=display(loan.hoa),vaFirstUse=loan.vaUse!=='subsequent',vaExempt=loan.vaExempt==='yes';
 const numeric=v=>v===''?NaN:Number(v);
 const setHomePrice=v=>change('price',numeric(v)),setDownPct=v=>change('downPct',numeric(v)),setTermYears=v=>change('years',numeric(v)),setRate=v=>change('rate',numeric(v)),setTaxRate=v=>change('tax',loan.price*numeric(v)/100),setInsuranceAnnual=v=>change('insurance',numeric(v)),setHoaMonthly=v=>change('hoa',numeric(v)),setVaFirstUse=v=>change('vaUse',v?'first':'subsequent'),setVaExempt=v=>change('vaExempt',v?'yes':'no');
 const setLoan=type=>onChange({...loan,type,downPct:Math.max(Number(loan.downPct)||0,type==='conv'?3:type==='fha'?3.5:0)});
 const result=safeProduct(toMilitaryLoan({...loan,extra:0}));
 const {downPayment,baseLoan,upfrontFee,upfrontLabel,totalLoan,ltv,totalMonthly}=result,hp=Number(homePrice)||0,dp=Number(downPct)||0,totalInterest=result.sched.totalInterest;
 const loanTypeInfo=Object.fromEntries(Object.entries(loanDescriptions).map(([key,desc])=>[key,{desc}]));
 return (<section className="gc-military-calculator gc-monthly" data-component="LoanCalculator"><Eyebrow>Mortgage Payment Calculator</Eyebrow><H2>Conventional, FHA and VA loans</H2><p className="cal-help" style={{marginBottom:24}}>Use your lender's quote and the property's actual costs. Every starting figure is an illustration.</p><ErrorMessage message={result.error}/>

<div className="gc-payment-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))", gap: 32 }}>
          <div>
            <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.elevated, padding: 4, borderRadius: 8 }}>
              {[{id:"conv",label:"Conventional"},{id:"fha",label:"FHA"},{id:"va",label:"VA Loan"}].map(t => (
                <button key={t.id} aria-pressed={loanType === t.id} onClick={() => setLoan(t.id)} style={{
                  flex: 1, padding: "10px 12px",
                  background: loanType === t.id ? C.gold : "transparent",
                  color: loanType === t.id ? C.ink : "rgba(255,255,255,0.75)",
                  border: "none", borderRadius: 6,
                  fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
                  cursor: "pointer", fontFamily: SS,
                }}>{t.label}</button>
              ))}
            </div>
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.6, marginBottom: 24, fontStyle: "italic" }}>{loanTypeInfo[loanType].desc}</p>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Home Price</label>
              <input type="number" aria-label="Home price" value={homePrice} onChange={e=>setHomePrice(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Down Payment %</label>
                <input type="number" step="0.5" aria-label="Down payment percent" value={downPct} onChange={e=>setDownPct(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Down Payment $</label>
                <div style={{ ...inputStyle, color: C.gold, display: "flex", alignItems: "center" }}>{fmt(downPayment)}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Interest Rate %</label>
                <input type="number" step="0.125" aria-label="Interest rate percent" value={rate} onChange={e=>setRate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Loan Term (yrs)</label>
                <select aria-label="Loan term in years" value={termYears} onChange={e=>setTermYears(Number(e.target.value))} style={inputStyle}>
                  {[30,25,20,15,10].map(term=><option key={term} value={term}>{term}</option>)}
                  {![30,25,20,15,10].includes(Number(termYears))&&<option value={termYears}>{termYears}</option>}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Property Tax Rate %</label>
                <input type="number" step="0.05" aria-label="Property tax rate percent" value={taxRate} onChange={e=>setTaxRate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Home Insurance /yr</label>
                <input type="number" step="100" aria-label="Home insurance per year" value={insuranceAnnual} onChange={e=>setInsuranceAnnual(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>HOA (monthly, optional)</label>
              <input type="number" step="10" aria-label="HOA monthly optional" value={hoaMonthly} onChange={e=>setHoaMonthly(e.target.value)} style={inputStyle} />
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}><NumberField label="Separate Flood Insurance /yr" value={loan.flood} onChange={v=>change("flood",v)}/>{loanType==="conv"&&<NumberField label="Annual PMI Rate %" value={loan.pmi} onChange={v=>change("pmi",v)} max={5}/>}</div><ProgramNotes loan={toMilitaryLoan(loan)}/><p className="cal-help">Property tax: {fmt2(loan.tax)} per year. Confirm the bill after purchase and property-specific insurance quotes.</p>
            {loanType!=="conv"&&<label style={labelStyle}>Upfront program fee<select aria-label="Upfront program fee" value={loan.financeFee||"yes"} onChange={e=>change("financeFee",e.target.value)} style={inputStyle}><option value="yes">Finance the fee</option><option value="no">Pay the fee at closing</option></select></label>}
            {loanType === "va" && (
              <div style={{ background: C.elevated, border: `1px solid ${C.hairline}`, padding: 16, borderRadius: 8, marginBottom: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontSize: 13, cursor: "pointer", marginBottom: 10 }}>
                  <input type="checkbox" checked={vaFirstUse} onChange={e=>setVaFirstUse(e.target.checked)} /> First-time VA loan use
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={vaExempt} onChange={e=>setVaExempt(e.target.checked)} /> Lender-confirmed funding-fee exemption
                </label>
              </div>
            )}
          </div>

          <div hidden={!!result.error}>
            <div style={{ background: C.elevated, border: `2px solid ${C.goldLine}`, borderRadius: 12, padding: 28, marginBottom: 16 }}>
              <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontFamily: SS }}>Estimated Monthly Payment</div>
              <div style={{ fontFamily: SF, color: "#fff", fontSize: 44, fontWeight: 500, marginBottom: 20, lineHeight: 1 }}>{fmt2(totalMonthly)}</div>
              <PaymentBreakdown result={result}/>
            </div>

            <div style={{ background: C.elevated, border: `1px solid ${C.hairline}`, borderRadius: 12, padding: 24 }}>
              <div style={{ color: C.gold, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontFamily: SS }}>Loan Summary</div>
              <div style={rowStyle}>
                <span style={{ color: C.muted, fontSize: 13 }}>Home Price</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{fmt(hp)}</span>
              </div>
              <div style={rowStyle}>
                <span style={{ color: C.muted, fontSize: 13 }}>Down Payment ({dp}%)</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{fmt(downPayment)}</span>
              </div>
              <div style={rowStyle}>
                <span style={{ color: C.muted, fontSize: 13 }}>Base Loan Amount</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{fmt(baseLoan)}</span>
              </div>
              {upfrontFee > 0 && (
                <div style={rowStyle}>
                  <span style={{ color: C.muted, fontSize: 13 }}>{upfrontLabel}</span>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{fmt(upfrontFee)}</span>
                </div>
              )}
              <div style={rowStyle}>
                <span style={{ color: C.muted, fontSize: 13 }}>Total Financed</span>
                <span style={{ color: C.gold, fontSize: 14, fontWeight: 700 }}>{fmt(totalLoan)}</span>
              </div>
              <div style={rowStyle}>
                <span style={{ color: C.muted, fontSize: 13 }}>Loan-to-price ratio</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{ltv.toFixed(1)}%</span>
              </div>
              <div style={{ ...rowStyle, borderBottom: "none" }}>
                <span style={{ color: C.muted, fontSize: 13 }}>Total Interest ({termYears} yrs)</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{fmt(totalInterest)}</span>
              </div>
            </div>
          </div>
        </div>
</section>);};
export function MilitaryCalculatorPanel({panel,initialState,bridge}){
 const [snapshot,setSnapshot]=useState(()=>initialState||bridge.get());
 useEffect(()=>bridge?.subscribe(()=>setSnapshot({...bridge.get()})),[bridge]);
 const update=(key,value)=>bridge?.update(key,value);
 if(panel==='payment')return <MonthlyPayment loan={snapshot.loan} onChange={v=>update('loan',v)}/>;
 if(panel==='compare')return <LoanComparison a={toMilitaryLoan(snapshot.loan)} b={toMilitaryLoan(snapshot.compareB)} setA={v=>update('loan',fromMilitaryLoan(v))} setB={v=>update('compareB',fromMilitaryLoan(v))} horizon={snapshot.horizon} setHorizon={v=>update('horizon',Number(v))}/>;
 const r=safeProduct(toMilitaryLoan(snapshot.loan));
 return r.error?<div className="gc-military-calculator"><H2>Run the Numbers on Extra Payments</H2><ErrorMessage message={r.error}/><button type="button" className="cal-button" data-go="payment">Review Monthly payment inputs</button></div>:<AmortizationAnalyzer principal={r.totalLoan} annualRate={snapshot.loan.rate} years={snapshot.loan.years} basePayment={r.basePmt} extras={snapshot.extra} setExtras={v=>update('extra',v)}/>;
}
