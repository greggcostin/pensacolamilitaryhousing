// Public office information checked September 7, 2026. No phone calls were made.
// Keep source dates separate from the September 6 financial-content edition.
import {page} from './schema.mjs';
export const DIRECTORY_REVIEWED = '2026-09-07';
export const directorySources = {};
const source = (id,name,url,extra={}) => { directorySources[id]={name,url,reviewed:DIRECTORY_REVIEWED,reviewIntervalDays:30,...extra}; return id; };
const mos='https://installations.militaryonesource.mil/military-installation/';
const netc='https://www.netc.navy.mil/Commands/';
const housing='https://ffr.cnic.navy.mil/Navy-Housing/Housing-By-Region/Southeast/';
source('dirNasReport','Military OneSource: NAS check-in',mos+'naval-air-station-pensacola/base-essentials/check-in-procedures');
source('dirNasc','NASC: Aviation Training School',netc+'Naval-Aviation-Schools-Command/Aviation-Training-School/');
source('dirNattc','NATTC: service-specific reporting',netc+'Center-for-Naval-Aviation-Technical-Training/Naval-Air-Technical-Training-Center/Reporting/');
source('dirCso2022','479 FTG: June 2022 welcome packet','https://www.jbsa.mil/Portals/102/Documents/12th%20FTW/Welcome%20Guide%2027%20Jun%2022.pdf?ver=q17kNtXuVWMevNjmIbtJsw%3D%3D',{publicationDate:'2022-06-27',status:'archival_reconfirm'});
source('dirVt10','VT-10: student control','https://www.cnatra.navy.mil/tw6/vt10/phone-list.asp');
source('dirVt4','VT-4: contact desk','https://www.cnatra.navy.mil/tw6/vt4/contact-us.asp');
source('dirVt86','VT-86: student control','https://www.cnatra.navy.mil/tw6/vt86/phone-list.asp');
source('dirCorry','IWTC Corry: reporting',netc+'Center-for-Information-Warfare-Training/Information-Warfare-Training-Command-Corry-Station/Reporting-Information/');
source('dirCorryMarines','Marine Detachment Corry','https://www.matsg21.marines.mil/Units/Marine-Corps-Detachment-Corry-Station/');
source('dirNetpdc','NETPDC: current contact page',netc+'Naval-Education-and-Training-Professional-Development-Center/Contact-Us/');
source('dirNetpdcLegacy','NETPDC: alternate contact listing','https://www.netc.navy.mil/NETPDC/NETPDC-Contact-Us/',{status:'conflicting_address'});
source('dirSaufley','Florida DEP: Saufley location','https://floridadep.gov/waste/waste-cleanup/content/naval-air-station-pensacola%E2%80%99s-saufley-field-pfas-investigation');
source('dirDantes','DANTES: education help desk','https://www.dantes.mil/About-DANTES/Contact-Us-Test/');
source('dirMilgears','DANTES: MilGears support','https://www.dantes.mil/Education-Programs/MilGears/');
source('dirRsc','NAS: personnel support / ID lab','https://cnrse.cnic.navy.mil/Installations/NAS-Pensacola/About/Installation-Guide/RSC-Pensacola/');
source('dirNasId','Military OneSource: Florida ID offices','https://installations.militaryonesource.mil/search?program-service=50%2Fstate%3DFlorida');
source('dirIdco','ID Card Office Online','https://idco.dmdc.osd.mil/idco/locator');
source('dirNasHhg','NAS Pensacola: household goods',mos+'naval-air-station-pensacola/moving/household-goods');
source('dirHhgEmail','Regional Navy HHG contact',mos+'naval-air-station-meridian/moving/household-goods');
source('dirNasHousing','Navy: Pensacola housing offices',housing+'NAS-Pensacola/');
source('dirNasGate','NAS Pensacola: visitor access','https://cnrse.cnic.navy.mil/Installations/NAS-Pensacola/');
source('dirLodge','Navy Lodge Pensacola','https://www.navy-lodge.com/pensacola');
source('dirNgu','Navy: NAS lodging contact','https://www.cnrc.navy.mil/NRC-Command/Navy-Recruiting-Orientation-Unit/');
source('dirNasFfsc','NAS: Fleet and Family support',mos+'naval-air-station-pensacola/military-and-family-support-center/financial-assistance');
source('dirNasSl','Pensacola School Liaison','https://www.navymwrpensacola.com/programs/ddab9fec-1223-46aa-9705-d8e175ed0915');
source('dirCorryCdc','Corry Child Development Center','https://www.navymwrpensacola.com/programs/bed32613-1cf4-4496-a84e-14a732c3b583');
source('dirNasCdc','NAS Child Development Center','https://www.navymwrpensacola.com/programs/8b876326-6890-4c6b-9179-79bdb22c9aa5');
source('dirCorryYouth','Corry Youth Center','https://www.navymwrpensacola.com/programs/465596d4-4884-499b-84e3-ed660e96b3f4');
source('dirNhCare','Naval Hospital: primary care','https://pensacola.tricare.mil/Health-Services/Primary-Care');
source('dirNhAccess','Naval Hospital: current access notice','https://pensacola.tricare.mil/About-Us/Contact-Us');
source('dirNhUrgent','Naval Hospital: urgent care / no ER','https://pensacola.tricare.mil/Health-Services/Urgent-Care');
source('dirNasEfmp','NAS: medical EFMP',mos+'naval-air-station-pensacola/exceptional-family-member-program/health-care-special-needs');
source('dirNavyLegal','Navy: Southeast legal assistance','https://www.jag.navy.mil/legal-services/southeast/');
source('dirNasRelief','NAS: emergency assistance',mos+'naval-air-station-pensacola/base-essentials/emergency-assistance');
source('dirTw5','TW-5: incoming flight students','https://www.cnatra.navy.mil/tw5/check-in-student.asp');
source('dirTw5Staff','TW-5: staff check-in','https://www.cnatra.navy.mil/tw5/check-in-staff.asp');
source('dirWhiting','NAS Whiting: quarterdeck / CDO','https://cnrse.cnic.navy.mil/Installations/NAS-Whiting-Field/Contact-Us/');
source('dirWhitingTech','CNATT Whiting: student control',netc+'Center-for-Naval-Aviation-Technical-Training/Whiting-Field/Contact-Us/');
source('dirWhitingHousing','Navy: Whiting housing offices',housing+'NAS-Whiting-Field/');
source('dirWhitingHhg','Whiting: temporary HHG closure',mos+'naval-air-station-whiting-field/moving/household-goods',{reviewIntervalDays:7,status:'temporary_service_change'});
source('dirWhitingSupport','Whiting: support / ID contacts',mos+'naval-air-station-whiting-field/base-essentials/emergency-assistance');
source('dirWhitingFfsc','Whiting Fleet and Family support','https://www.navymwrwhitingfield.com/programs/2413bd64-9bae-4be1-b875-47525d03b0f2');
source('dirWhitingClinic','Whiting Branch Health Clinic','https://pensacola.tricare.mil/Clinics/NBHC-Whiting-Field');
source('dirWhitingCdc','Whiting Child Development Center','https://www.navymwrwhitingfield.com/programs/1d5f7d69-eedd-4f2b-89f3-015b153fc9af');
source('dirWhitingSl','Whiting School Liaison','https://www.navymwrwhitingfield.com/child-youth/school-liaison');
source('dirNavySlEmails','Navy: regional School Liaison contacts','https://www.navymwrpensacola.com/modules/media/?do=download&id=11ff5901-3be4-4afb-b818-4fd92b574894');
source('dirWhitingUnits','Whiting: major unit contacts',mos+'naval-air-station-whiting-field/base-essentials/major-units');
source('dirAfFlorida','Air Force: Florida office locator','https://myairforcebenefits.us.af.mil/Benefit-Library/Resource-Locator/Florida');
source('dirEglinFss','Eglin: FSS facility directory','https://eglin96fss.com/directory/');
source('dirEglinMpf','Eglin: MPF / DEERS','https://eglin96fss.com/mpf/',{reviewIntervalDays:7,status:'temporary_service_change'});
source('dirEglinFinance','Eglin: finance contact','https://installations.militaryonesource.mil/search?program-service=54%2Finstallation%3Deglin-afb');
source('dirEglinHhg','Eglin: household goods',mos+'eglin-afb/moving/household-goods');
source('dirEglinLegal','Eglin: legal assistance',mos+'eglin-afb/legal/legal-assistance');
source('dirEglinMedical','Eglin: medical appointments','https://eglin.tricare.mil/Getting-Care/Appointments-Referrals');
source('dirEglinF35','Eglin: Navy F-35 students',netc+'Center-for-Naval-Aviation-Technical-Training/Eglin-AFB/Navy-Student-Information/');
source('dirHurlburtMpf','Hurlburt: MPF customer support','https://myhurlburt.com/military-personnel/');
source('dirHurlburtFss','Hurlburt: FSS facility directory','https://myhurlburt.com/directory/');
source('dirHurlburtHhg','Hurlburt: household goods',mos+'hurlburt-field/moving/household-goods');
source('dirDukeMpf','Duke: Military Personnel Flight','https://duke919fss.com/military-personnel-flight/');
source('dirDukeId','Duke: DEERS / ID appointments','https://duke919fss.com/deers-and-id/');
source('dirDukeMfrc','Duke: Military and Family Readiness','https://duke919fss.com/military-and-family-readiness-center/');
source('dirDukeInn','Duke Inn: reservations','https://duke919fss.com/duke-inn/');
source('dirTyndallList','Tyndall: January 2026 phone list','https://www.tyndall.af.mil/Portals/107/documents/TYNDALL%20AFB%20CONTACT%20LISTINGS%20(CAO%2014%20Jan%202026).pdf?ver=NZNY2qPwEDwOGXSJMEEsBQ%3D%3D',{publicationDate:'2026-01-14'});
source('dirTyndallMpf','Tyndall: MPF / Base Intro','https://tyndallfss.com/military-personnel-flight/');
source('dirTyndallSl','Tyndall: School Liaison program','https://www.tyndall.af.mil/SLO/');
source('dirTyndallCdc','Tyndall: childcare contact',mos+'tyndall-afb/child-and-youth-services/child-care');
source('dirTyndallInn','Tyndall: Sand Dollar Inn','https://tyndallfss.com/lodging-sand-dollar-inn/');
source('dirTyndallLodgingBook','Tyndall: lodging newcomer reference','https://www.dodlodging.net/documents/Sand-Dollar-Inn-GuestBook.pdf',{publicationDate:'2025-12-11'});
source('dirNsa','NSA Panama City: command contacts','https://cnrse.cnic.navy.mil/Installations/NSA-Panama-City/Contact-Us/');
source('dirNsaHousing','Navy: Panama City housing offices',housing+'NSA-Panama-City/');
source('dirDive','NDSTC: command contacts',netc+'Center-for-Explosive-Ordnance-Disposal-and-Diving/Naval-Diving-and-Salvage-Training-Center/Contact-Us/');
source('dirDiveNavy','NDSTC: Navy student reporting',netc+'Center-for-Explosive-Ordnance-Disposal-and-Diving/Naval-Diving-and-Salvage-Training-Center/Navy-Student-Information/');
source('dirDiveAf','NDSTC: Air Force dive supervisor instructions','https://www.netc.navy.mil/Portals/46/CEODD/NDSTC/doc/Air%20Force%20Combat%20Dive%20Supervisor.pdf?ver=t7vJ569PcGPuTIOGYesMFw%3D%3D');
source('dirDiveMarine','NDSTC: Marine student desk',netc+'Center-for-Explosive-Ordnance-Disposal-and-Diving/Naval-Diving-and-Salvage-Training-Center/Marine-Corps-Student-Information/');
source('dirNsaClinic','Panama City Branch Health Clinic','https://pensacola.tricare.mil/Clinics/NBHC-Panama-City');
source('dirNsaFfsc','Panama City: Fleet and Family support','https://www.navymwrpanamacity.com/programs/86a3c94d-1454-4047-8826-f06871d68ef5',{status:'conflicting_phone'});
source('dirNsaSl','Panama City School Liaison','https://www.navymwrpanamacity.com/programs/b8ae336b-d7da-4061-a711-2ee9e5173ca0');
source('dirNsaYouth','Panama City: youth programs','https://www.navymwrpanamacity.com/programs/9a70b72a-b37b-4de6-bb87-6e9a8d3397c7');
source('dirNsaChapel','NSA Panama City: chaplain','https://cnrse.cnic.navy.mil/Installations/NSA-Panama-City/Resources/Chaplains-Office/');
source('dirMso','Military OneSource: assistance','https://www.militaryonesource.mil/education-employment/for-service-members/4-tips-for-transition-and-career-success/');

export const contacts={};
const c=(id,title,scope,purpose,location,phones,sourceIds,extra={})=>contacts[id]={type:'contact',contactId:id,title,scope,purpose,location,phones:phones.map(([label,number])=>({label,number})),sourceIds,reviewed:DIRECTORY_REVIEWED,...extra};
// Public organizational inboxes only. Addresses describe the office, not guaranteed gate access.
c('nasDuty','NAS permanent-party reporting','NAS Pensacola main','Use this quarterdeck when your orders assign you to NAS. Tenant commands and schools have their own reporting desks.','Building 1500, NAS Pensacola',[['Quarterdeck','850-452-4785']],['dirNasReport']);
c('nasc','Navy aviation officers: NASC / NIFE','NAS Pensacola main','For assigned student aviators and Naval Flight Officers starting Naval Introductory Flight Evaluation. Confirm the current welcome packet with Flight Management.','181 Chambers Avenue, Suite C; Building 633',[['Flight Management','850-452-4552'],['Quarterdeck / after hours','850-452-2414']],['dirNasc','dirNasReport'],{caveat:'The public page retains legacy COVID instructions; ask for current onboarding.'});
c('cso','Air Force CSO: 479th FTG','NAS Pensacola main','Undergraduate Combat Systems Officer Training uses the Air Force 479th FTG / 479th Student Squadron route. Do not check in with Navy NIFE solely because you are an aviation officer.','Call the 479th FTG CSS for your reporting building.',[['479 FTG CSS','850-452-2215']],['dirNasReport','dirCso2022'],{caveat:'The June 2022 packet lists STUCON in Building 746. Reconfirm that location with CSS.'});
c('nattc','NATTC technical-training students','NAS Pensacola main','For orders naming NATTC. Navy students use the quarterdeck; assigned Army and Air Force students use NATTC Student Control. This is separate from Air Force CSO training.','Chevalier Hall, Building 3460',[['NATTC quarterdeck','850-452-7300']],['dirNattc']);
c('matsg','Marine aviation students / staff','NAS Pensacola main','MATSG-21 / MATSG-23 support commissioned students, instructors and staff. NATTC Marine students also follow their Marine reporting instructions. Confirm your specific detachment.','Building 3450, NAS Pensacola',[['MATSG desk','850-452-9460 ext. 3005']],['dirNasReport','dirNattc']);
c('vt10','Training Air Wing Six: VT-10','NAS Pensacola main','For NFO students assigned to VT-10. Contact your assigned squadron about reporting; a wing address alone does not identify your student desk.','250 San Carlos Road, Suite H, Pensacola, FL 32508',[['Student control','850-452-3078'],['Alternate','850-452-4353']],['dirVt10']);
c('vt4','Training Air Wing Six: VT-4','NAS Pensacola main','For students whose orders or training transfer assign them to VT-4. Ask Student Control for current check-in instructions.','250 San Carlos Road, Suite I, Pensacola, FL 32508',[['Student control','850-452-4449'],['Alternate','850-452-3321']],['dirVt4']);
c('vt86','Training Air Wing Six: VT-86','NAS Pensacola main','For NFO students assigned to VT-86. Confirm the reporting time and current student paperwork directly.','390 San Carlos Road, Suite G, Pensacola, FL 32508',[['Student control','850-452-3947'],['Alternate','850-452-4742']],['dirVt86']);
c('nasId','ID cards / DEERS','NAS Pensacola main','Use ID Card Office Online for the current appointment and document requirements. Saufley Street is on NAS main, not at Saufley Field.','421 Saufley Street, Suite B, Building 680',[['ID office','850-452-3969']],['dirRsc','dirNasId','dirIdco']);
c('nasRsc','Pay and personnel routing','NAS Pensacola main','Start with your command pay/personnel administrator (CPPA). RSC supports command representatives with personnel and pay cases; confirm routing before visiting.','421 Saufley Street, Suite B, Building 680',[['RSC office','850-452-3448']],['dirRsc'],{email:'RSC_Pensacola@us.navy.mil'});
c('nasHhg','Household goods / personal property','NAS Pensacola main','Shipment counseling, delivery coordination and move problems. Keep your shipment reference handy; ask for the approved channel for private records.','121 Cuddahy Street, Suite C, Building 680',[['Personal property','850-452-4654']],['dirNasHhg','dirHhgEmail'],{email:'hhg_pensacola@navy.mil'});
c('nasHousing','Government Housing Service Center','NAS Pensacola main','Housing eligibility, applications, community rentals and lease questions for the Pensacola installation area. Confirm student and unaccompanied rules before paying deposits.','1581 Duncan Road, Building 735, Pensacola, FL 32508',[['Housing office','850-452-5168']],['dirNasHousing'],{email:'Pensacola_Housing@us.navy.mil'});
c('nasGate','Visitors / installation access','NAS Pensacola main','Ask about authorized entry and guest sponsorship before travel. Museum access and a work assignment may use different instructions.','Visitor Control Center, Building 777, main gate',[['Visitor control','850-452-4153']],['dirNasGate'],{email:'Cnic_se_pnsc_vcc@us.navy.mil'});
c('nasLodge','Navy Lodge Pensacola','NAS Pensacola main','Reserve temporary lodging early; confirm family, pet and accessibility needs directly. A reservation does not determine reimbursement eligibility.','3875 Radford Boulevard, Building 3875',[['Front desk','850-456-8676']],['dirLodge','dirCorryMarines']);
c('nasInn','Navy installation lodging','NAS Pensacola main','Confirm the reservation, late-arrival plan and exact check-in desk. Keep lodging authorization separate from the booking.','600 Moffett Road, Building 249',[['Lodging desk','850-564-7473']],['dirNgu']);
c('nasUh','NATTC unaccompanied housing','NAS Pensacola main','Barracks questions after receiving your command housing assignment. Ask the desk which building is assigned to you.','905 East Avenue, Pensacola, FL 32508',[['NATTC UH front desk','850-452-7076']],['dirNasHousing']);
c('nasFfsc','Fleet and Family Support Center','NAS Pensacola main','Relocation orientation, spouse employment, financial counseling, family support and referrals. Ask about the next newcomer program and loan locker.','151 Ellyson Avenue, Building 625',[['FFSC','850-452-5990 ext. 0']],['dirNasFfsc']);
c('nasSl','School Liaison: all services','Corry Station','School transfers, district contacts, special-education navigation and youth transition support. Confirm school assignment for your home address.','4119 Children’s Lane, Pensacola, FL 32511',[['School Liaison','850-458-6588']],['dirNasSl'],{email:'PensacolaSL@us.navy.mil'});
c('corryCdc','Corry childcare','Corry Station','Ask about childcare requests and current availability. The center can explain the application process for your family.','4119 Children’s Lane, Pensacola, FL 32511',[['Child Development Center','850-453-6310']],['dirCorryCdc']);
c('nasCdc','NAS childcare','NAS Pensacola main','Early-childhood care inquiries and application guidance. Ask about care hours that fit your training or work schedule.','710 Moffett Road, Building 3634',[['Child Development Center','850-452-2211']],['dirNasCdc']);
c('corryYouth','Youth / school-age programs','Corry Station','Ask about school-age care, youth activities and newcomer participation. Confirm transport and enrollment separately.','4118 Children’s Way, Building 4118',[['Youth Center','850-453-3490']],['dirCorryYouth']);
c('nh','Naval Hospital Pensacola','Near Corry Station','Primary-care appointments and care-team routing. This hospital has no emergency room; call 911 for an emergency.','6000 West Highway 98, Pensacola, FL 32512',[['Appointments','850-505-7171']],['dirNhCare','dirNhAccess','dirNhUrgent'],{caveat:'Current notice routes hospital access through Corry gate 10. Recheck before driving.'});
c('nasLegal','Legal assistance','NAS Pensacola main','Appointments for eligible clients with powers of attorney, wills and personal legal questions. Call the regional appointment desk first.','121 Cuddahy Street, Suite B, Building 680',[['Appointments','904-969-1492']],['dirNavyLegal']);
c('nasEfmp','Medical EFMP coordination','Pensacola medical network','For Exceptional Family Member Program medical coordination. FFSC and the School Liaison handle different family-support and education needs.','Call for the appointment site and required records.',[['Medical EFMP','850-505-6152']],['dirNasEfmp']);
c('nasRelief','Navy-Marine Corps Relief Society','NAS Pensacola','Ask about emergency financial assistance and eligibility. Confirm the visit location with the office.','NAS Pensacola; call before visiting.',[['Office','850-452-2300']],['dirNasRelief'],{email:'pensacola@nmcrs.org'});
c('corryDuty','IWTC Corry: first reporting stop','Corry Station','Students and staff report with original orders. The public reporting page lists this quarterdeck as the around-the-clock arrival contact.','440 Roberts Avenue, Building 3714',[['Quarterdeck','850-452-6618']],['dirCorry','dirCorryMarines'],{email:'CID_UCS_Sponsor@navy.mil'});
c('corryStudent','IWTC Student Management','Corry Station','After initial check-in, confirm next-workday processing here. A-school arrivals and fleet returnees have different follow-on arrangements.','Building 502, Room 104W',[['Confirm through quarterdeck','850-452-6618']],['dirCorry'],{caveat:'The official page lists both 6:15 and 7 a.m. Call for the correct current muster time.'});
c('corryStaff','IWTC staff / officer students','Corry Station','Staff not attending NITC use Admin after check-in. NITC arrivals initially process as students. Officer students should request their current welcome packet.','Staff Admin: Building 503; first check-in: Building 3714',[['Quarterdeck / routing','850-452-6618']],['dirCorry']);
c('corryMarine','Marine Detachment Corry','Corry Station','Marines follow detachment instructions. After working hours, contact the Corry quarterdeck and Marine Staff Duty Officer.','Building 511, Room 103, Corry Station',[['Detachment','850-452-6543'],['Staff Duty Officer','850-760-3882']],['dirCorryMarines']);
c('corryBeq','Fleet-returnee student lodging','Corry Station','The IWTC reporting page directs fleet-returnee students to this BEQ contact. Confirm your assigned lodging category before booking elsewhere.','Building 1084, Corry Station',[['BEQ','850-452-6541']],['dirCorry']);
c('saufleyWork','Confirm the actual Saufley worksite','Saufley Field','Use the gaining unit and sponsor named on your orders. Obtain the building, authorized gate and after-hours number before travel; there is no universal tenant check-in desk.','Installation location: 6490 Saufley Field Road, Pensacola, FL 32509',[],['dirSaufley'],{caveat:'Record your unit’s reporting contact in the arrival worksheet later in this guide.'});
c('netpdc','NETPDC: confirm the office location','Command-specific','The current contact page lists 130 West Avenue, while another official page still lists Saufley Field. Ask your sponsor which workspace applies to your orders.','Current contact listing: 130 West Avenue, Building 603, Suite A, Pensacola, FL 32508',[],['dirNetpdc','dirNetpdcLegacy'],{caveat:'Use the command contact form for routing. The public-affairs inbox is not an in-processing desk.'});
c('dantes','DANTES education help desk','Online / all services','Questions about academic preparation, education options and credit by exam. Use the published program contact or help-desk ticket; this is not a tenant reporting office.','Online support; do not assume walk-in service at Saufley.',[],['dirDantes'],{email:'dodhra.dantes-cpl@mail.mil'});
c('milgears','MilGears career / credential tools','Online / all services','Help translating military experience into career and credential pathways. Contact the support team for the online tools.','Online support; confirm any appointment location.',[['Support','850-473-6291']],['dirMilgears']);

c('whDuty','Installation quarterdeck / duty officer','NAS Whiting Field','Permanent-party arrivals should follow their gaining command. Use these installation contacts when your sponsor directs you here or your arrival plan changes.','7550 USS Essex Street, Milton, FL 32570 (command address)',[['Quarterdeck','850-623-7084'],['Command Duty Officer','850-623-7921']],['dirWhiting']);
c('whFlight','Flight students: Training Air Wing Five','NAS Whiting Field','For assigned flight students. Student Services confirms the current check-in point and required packet. Navy, Marine and Coast Guard training assignments follow their service instructions.','TW-5; confirm the Student Services room before arrival.',[['Student Services','850-623-7058'],['Alternate','850-665-6377']],['dirTw5']);
c('whMarine','Marine flight-student support','NAS Whiting Field','MATSG-21 Support Detachment assists assigned Marines. Coordinate both service administration and TW-5 student requirements.','MATSG-21 Support Detachment; call for reporting location.',[['Support Detachment','850-623-7546']],['dirTw5']);
c('whTech','CNATT technical-course students','NAS Whiting Field','For orders naming CNATT Detachment Whiting Field. This technical-training route is separate from the TW-5 flight-student desk.','Building 2945, NAS Whiting Field',[['Student Control','850-623-7852'],['Detachment CDO','850-516-7086']],['dirWhitingTech']);
c('whId','ID cards / DEERS','NAS Whiting Field','Call for the current office location and appointment requirements. Pass and tag, visitor access and dependent ID issuance are different services.','Confirm the service location before visiting.',[['DEERS / ID','850-623-7587']],['dirWhitingSupport','dirIdco']);
c('whHousing','Government housing office','Milton / Whiting Pines area','Housing eligibility, referrals and lease questions. This government office is separate from the installation quarterdeck and privatized leasing staff.','570 Merrill Drive, Milton, FL 32570',[['Housing Service Center','850-623-9726']],['dirWhitingHousing'],{email:'WhitingField_Housing@us.navy.mil'});
c('whUh','Unaccompanied housing','NAS Whiting Field','Confirm your assigned barracks and actual check-in desk. The housing page lists a separate check-in point from the office address.','Office: 7426 USS Lexington Circle, Building 2957',[['Unaccompanied housing','850-623-7095']],['dirWhitingHousing']);
c('whHhg','Household goods: current alternate','Service at NAS Pensacola','Whiting’s public HHG page reports a temporary local-office closure and directs customers to Pensacola. Call before making either trip.','Pensacola PPO: 121 Cuddahy Street, Suite C, Building 680',[['Pensacola PPO','850-452-4654']],['dirWhitingHhg','dirNasHhg'],{caveat:'Temporary staffing arrangement; recheck the linked notice.'});
c('whFfsc','Fleet and Family Support Center','NAS Whiting Field','Newcomer referrals, relocation help, family counseling, financial education, EFMP support and spouse employment assistance.','7511 USS Enterprise Street, Building 3025',[['FFSC','850-623-7177']],['dirWhitingFfsc'],{email:'cnic_se_whtg_ffsc@us.navy.mil'});
c('whClinic','Health clinic / aviation medicine','NAS Whiting Field','Call the clinic menu for family medicine, military medicine, aviation medicine or dental. Use your assigned care team for medical in-processing.','7119 Langley Street, Milton, FL 32570',[['Clinic / department menu','850-623-7508'],['Central appointments','850-505-7000']],['dirWhitingClinic']);
c('whCdc','Child Development Center','NAS Whiting Field','Childcare requests, enrollment and availability. Discuss the hours you need before relying on a place.','7523 California Street, Building 36',[['CDC','850-623-7472']],['dirWhitingCdc']);
c('whSl','School Liaison: all services','Whiting / Santa Rosa County','School transfer help, district navigation, special-education questions and youth transition resources. Call for appointment location.','Whiting School Liaison; confirm the meeting location.',[['School Liaison','850-665-6105']],['dirWhitingSl','dirNavySlEmails'],{email:'whitingfieldsl@us.navy.mil'});
c('whSecurity','Security: non-emergency questions','NAS Whiting Field','For routine installation security questions. For an emergency, call 911 and identify the installation, building and gate or landmark.','NAS Whiting Field; call before visiting.',[['Base Security','850-623-7036']],['dirWhitingUnits']);
c('whStaff','TW-5 staff arrivals','NAS Whiting Field','Staff members use the wing’s staff welcome instructions, not the flight-student checklist. Confirm the unit sponsor and reporting building.','TW-5; exact worksite depends on the assigned office.',[['TW-5 duty contact','850-637-2793']],['dirTw5Staff','dirWhitingUnits']);

c('egMpf','MPF / ID cards and DEERS','Eglin main installation','Coordinate unit arrival with your sponsor or CSS, then confirm MPF processing and ID requirements. Check the current service notice before visiting.','310 Van Matre Avenue, Building 210',[['ID customer support','850-882-6097'],['MPF','850-882-6365']],['dirEglinMpf','dirEglinFss'],{caveat:'September 2026 reduced-service notices are posted on the MPF page.'});
c('egFinance','Finance / PCS pay questions','Eglin main installation','Confirm travel voucher, BAH, entitlements and finance in-processing. Ask about the current briefing and required documents.','West Van Matre Avenue, Building 210, Room 189',[['Finance','850-882-2787']],['dirEglinFinance']);
c('egHhg','Transportation / household goods','Eglin main installation','Shipment counseling, delivery changes and move problem routing. Have your shipment reference and current contact details ready.','310 Van Matre Avenue, Building 210, Room 169',[['Personal property','850-882-8331']],['dirEglinHhg']);
c('egHousing','Government housing office','Eglin main installation','Confirm housing eligibility, referrals and student or duty-status restrictions. Ask about the location of any offered housing.','2950 Azalea Drive, Building 38499',[['Military Housing Office','850-882-4533 ext. 3']],['dirAfFlorida'],{email:'96ceg.cemh@us.af.mil'});
c('egDorm','Unaccompanied housing','Eglin main installation','Dorm assignment and housing questions for eligible members. Confirm your assigned building with your unit and the housing team.','212 East Daytona Drive, Building 822',[['Dorm management','850-882-5153']],['dirAfFlorida'],{email:'96ceg.ceihd.uh@us.af.mil'});
c('egInn','Eglin Inns','Eglin main installation','Temporary lodging reservations and arrival instructions. Ask about family, pet and accessibility requirements before booking.','1008 Boatner Road, Building 11001',[['Lodging reception','850-882-8761']],['dirEglinFss']);
c('egF35','Navy F-35 technical students','Eglin training area','Only for orders naming CNATT Detachment Eglin. Confirm the assigned course and arrival instructions; other Eglin schools have separate reporting routes.','F-35 Academic Training Center, 1416 Lightning Way',[['Assistant CDO','850-883-4655']],['dirEglinF35']);
c('egLegal','Legal assistance','Eglin main installation','Ask about eligibility, appointments, powers of attorney and personal legal questions connected to your move.','201 West Van Matre Avenue, Building 2',[['Legal office','850-882-4612']],['dirEglinLegal']);
c('egMfrc','Military and Family Readiness','Eglin main installation','Newcomer orientation, relocation, spouse employment, family support and financial counseling. Ask which programs fit your duty status.','502 West Van Matre Avenue, Building 205',[['M&FRC','850-882-9060']],['dirEglinFss','dirAfFlorida'],{email:'eglin.eglinairmanfamilyreadinesscenter@us.af.mil'});
c('egMedical','96th Medical Group','Eglin main installation','Appointments, care-team routing and referral questions. Confirm your assigned clinic and whether a referral is needed.','Medical Administration, Building 2793; confirm appointment site.',[['Appointments','850-883-8600'],['Referral management','850-883-9174']],['dirEglinMedical']);
c('egSl','School Liaison','Eglin main installation','School transitions, military-family education questions and district navigation. Verify the exact assigned school with the district.','Building 2397, Oak Hill, across from Unity Park',[['School Liaison','850-882-4319']],['dirEglinFss']);
c('egCdc','Child Development Centers','Eglin main installation','Ask which center matches your requested care, age group and availability. Confirm enrollment and waitlist steps.','Boatner Road: CDC II, Building 2782; CDC III, Building 2781',[['CDC II','850-883-7425'],['CDC III','850-882-5519']],['dirEglinFss']);
c('egYouth','School-age care / youth programs','Eglin main installation','Before- and after-school care and youth activities. Ask about transport, enrollment and program eligibility.','2582 Hatchee Road; school-age care in Building 2582B',[['School-age care','850-882-8291'],['Youth Center','850-882-8212']],['dirEglinFss']);
c('egEducation','Education and training support','Eglin main installation','Education counseling and program routing for assigned members. Confirm appointment and testing requirements directly.','505 West D Avenue, Building 251',[['Education office','850-882-8141']],['dirEglinFss'],{email:'96fss.eglineducationoffice@us.af.mil'});
c('egChapel','Chaplain / religious support','Eglin main installation','Spiritual support and chaplain appointments. Ask which chapel or office to visit.','East Gate: 202 North 8th Street; West Gate: 3005 Eglin Boulevard',[['Chapel office','850-882-2111']],['dirAfFlorida']);
c('egRec','Outdoor recreation','Eglin main installation','Recreation orientation, equipment and local activity questions. Confirm eligibility and reservations for the activity you want.','End of Flagler Road, Building 732',[['Outdoor recreation','850-882-5058']],['dirEglinFss'],{email:'eglin.outdoorrec@us.af.mil'});

c('huMpf','MPF / ID cards and DEERS','Hurlburt Field','Your sponsor or CSS starts the unit arrival process. Contact MPF customer support for ID, DEERS and personnel routing.','212 Lukasik Avenue, Building 90210',[['Customer support','850-884-4110 option 1']],['dirHurlburtMpf'],{email:'1sofss.fsmpss@us.af.mil'});
c('huFinance','Finance / PCS travel pay','Hurlburt Field','Confirm voucher processing and allowance questions with finance. Use the official process for private travel and pay documents.','212 Lukasik Avenue, Building 90210',[['Finance','850-884-4119']],['dirHurlburtFss','dirAfFlorida']);
c('huHhg','Transportation / household goods','Hurlburt Field','Shipment counseling and delivery coordination. Ask about your shipment’s current status and the correct issue-resolution channel.','212 Lukasik Avenue, Building 90210',[['Personal property','850-884-6051']],['dirHurlburtHhg']);
c('huHousing','Government housing office','Hurlburt Field','Eligibility, housing options and community-housing guidance. Confirm your particular duty and household circumstances.','123 McMillan Street',[['Military Housing Office','850-884-7505']],['dirAfFlorida'],{email:'1SOCES.Housing@us.af.mil'});
c('huDorm','Unaccompanied housing','Hurlburt Field','Dorm assignment, arrival coordination and housing questions. Confirm the actual assigned room with your unit.','320 Tully Street, Building 90367',[['Dorm management','850-884-3188']],['dirAfFlorida']);
c('huInn','Commando Inn','Hurlburt Field','Temporary lodging reservations and arrival planning. Confirm late arrival, pets and family requirements with reception.','301 Tully Street, Building 90509',[['Lodging reception','850-884-7115']],['dirHurlburtFss','dirAfFlorida']);
c('huLegal','Legal assistance','Hurlburt Field','Appointment and eligibility questions for personal legal assistance, powers of attorney and move-related matters.','212 Lukasik Avenue, Building 90210',[['Legal office','850-884-7821']],['dirAfFlorida']);
c('huEducation','Education and training support','Hurlburt Field','Education counseling, training resources and testing referrals. Confirm the service and documents you need.','221 Lukasik Avenue, Building 90220',[['Education office','850-884-6724']],['dirAfFlorida'],{email:'1sofss.fsde@us.af.mil'});
c('huMfrc','Military and Family Readiness','Hurlburt Field','Newcomer programs, relocation help, spouse employment, family support and financial counseling.','220 Lukasik Avenue, Building 90213',[['M&FRC','850-884-5441']],['dirHurlburtFss'],{email:'1sofss.fsh@us.af.mil'});
c('huMedical','1st Special Operations Medical Group','Hurlburt Field','Appointments and medical in-processing routing. Confirm your care team and clinic location. Use 911 for emergencies.','113 Lielmanis Avenue',[['Medical appointment line','850-881-1020']],['dirAfFlorida']);
c('huSl','School Liaison','Hurlburt Field','School transfer questions, district contacts and youth transition support. Ask about the schools serving your particular address.','117 McMillan Street, Building 90304',[['School Liaison','850-884-6938']],['dirHurlburtFss'],{email:'hurlburtfieldcyes@us.af.mil'});
c('huCdc','Childcare: main and east centers','Hurlburt Field','Ask about placement, requests and the center suitable for your household. Availability and hours should be confirmed directly.','Main: 108 McMillan Street; East: 133 Lielmanis Drive',[['CDC main','850-884-6664'],['CDC east','850-881-1261']],['dirHurlburtFss']);
c('huCdcWest','Childcare: west center','Hurlburt Field','A separate childcare location. Coordinate the request and daily route with the center before relying on a place.','26 Weaver Street, Building 90306',[['CDC west','850-884-5154']],['dirHurlburtFss']);
c('huYouth','Youth / school-age care','Hurlburt Field','School-age care, youth activities and teen-program questions. Ask about current enrollment and transportation.','117 McMillan Street, Building 90304',[['Youth programs','850-884-6355']],['dirHurlburtFss']);
c('huChapel','Chaplain / religious support','Hurlburt Field','Spiritual support, chaplain appointments and program information. Ask about the appropriate contact for after-hours needs.','210 Cody Avenue, Building 90203',[['Chapel office','850-884-7795']],['dirAfFlorida']);
c('huItt','Information, Tickets and Travel','Hurlburt Field','Ask about recreation options, eligibility and reservations. A useful starting point for learning the area after arrival.','424 Cody Avenue, Building 90229',[['ITT','850-884-6795']],['dirHurlburtFss'],{email:'hurlburtfielditt@gmail.com'});

c('duMpf','919th: personnel / unit routing','Duke Field','Start with the gaining unit and sponsor. Reserve, active-duty and other assignments can have different arrival and entitlement requirements. MPF helps route personnel questions.','100 East Ford Street, Building 3002',[['MPF','850-883-6433']],['dirDukeMpf','dirAfFlorida'],{email:'919SOFSS.FSMP.CustomerSupportSec@us.af.mil'});
c('duId','DEERS / ID appointments','Duke Field','The current Duke service page specifies appointments. Use its ID Card Office Online link and check the document requirements before travel.','100 East Ford Street, Duke Field',[['ID / customer support','850-883-6433']],['dirDukeId']);
c('duFinance','919th finance','Duke Field','Ask about your orders, duty status, travel voucher and allowances. Association with Duke alone does not establish a PCS entitlement.','Confirm the current finance counter through the office.',[['Finance','850-883-6663']],['dirAfFlorida']);
c('duMfrc','Military and Family Readiness','Duke Field','Relocation, family support, benefits navigation and Reserve-family resources. Ask about programs for your duty status and household.','3018 Blake Street, Building 3018',[['M&FRC','850-883-6474']],['dirDukeMfrc'],{email:'919sofss.airmanfamily.readinesscenter@us.af.mil'});
c('duInn','Duke Inn','Duke Field','Temporary lodging and arrival coordination. Ask reception about your orders, family needs and current check-in arrangements.','118 North Drone Street, Building 3054',[['Lodging','850-682-2918']],['dirDukeInn','dirAfFlorida'],{email:'919fsslg@us.af.mil'});
c('duFss','919 FSS / recreation orientation','Duke Field','Local service and recreation questions. The FSS can help identify the right office before a separate trip to Eglin.','100 East Ford Street, Building 3002, Room 112',[['FSS services','850-883-2992']],['dirDukeMfrc'],{email:'919fss.servicesmwr@us.af.mil'});

c('tyMpf','MPF / Base Intro / DEERS','Tyndall AFB','Coordinate unit arrival with your sponsor or CSS. Base Intro reviews in-processing packets and supports units without a CSS.','445 Suwannee Road, Building 662, first floor',[['MPF customer service','850-283-2387']],['dirTyndallMpf','dirTyndallList','dirAfFlorida'],{email:'325FSS.FSPS.CustomerSupport@us.af.mil'});
c('tyFinance','Finance / PCS pay','Tyndall AFB','Confirm the current briefing, voucher process and counter location. Public references differ on the building number, so call before visiting.','445 Suwannee Road; reconfirm the finance building / floor.',[['Finance','850-283-3580']],['dirTyndallList','dirAfFlorida','dirTyndallLodgingBook']);
c('tyHhg','Transportation / household goods','Tyndall AFB','Move counseling, shipment delivery and issue routing. Call for the current customer-service location before travel.','Tyndall TMO; confirm the current counter.',[['TMO','850-283-9350']],['dirTyndallList']);
c('tyHousing','Government housing office','Tyndall AFB','Eligibility, housing referrals and questions about the appropriate housing path for your assignment.','Tyndall Military Housing Office; confirm appointment location.',[['Military Housing Office','850-283-2737']],['dirTyndallList']);
c('tyInn','Sand Dollar Inn','Tyndall AFB','Reserve temporary lodging and confirm the exact arrival address with reception. Older official references list different lodging buildings.','Use the check-in location on your confirmed reservation.',[['Reservations / arrival','850-283-4210'],['Alternate','850-283-4211']],['dirTyndallInn','dirTyndallList']);
c('tyVcc','Visitor control / access','Tyndall AFB','Confirm authorized entry, guest requirements and current visitor-center arrangements. A pass request is separate from lodging.','2359 Roosevelt Boulevard, Building 2580 (verify before travel)',[['Visitor Control Center','850-283-9927']],['dirTyndallList','dirTyndallLodgingBook']);
c('tyLegal','Legal assistance','Tyndall AFB','Appointments and eligibility for powers of attorney, wills and personal legal questions.','445 Suwannee Road, Building 662, Base Support Center',[['Legal office','850-283-3233']],['dirTyndallList','dirAfFlorida'],{email:'325fw.ja@us.af.mil'});
c('tyCommand','Arrival problems / unit routing','Tyndall AFB','If your arrival plan fails, try your sponsor or unit duty contact first. Command Post can help route an after-hours command issue.','Call for routing; do not treat this as a walk-in desk.',[['Command Post','850-283-2155']],['dirTyndallList'],{caveat:'For police, fire or medical emergencies, call 911.'});
c('tyMfrc','Military and Family Readiness','Tyndall AFB','Newcomer support, relocation, spouse employment, financial counseling and family referrals.','445 Suwannee Road, Building 662',[['M&FRC','850-283-2400']],['dirTyndallList','dirAfFlorida'],{email:'325FSS.FSH.MFRC@us.af.mil'});
c('tyMedical','325th Medical Group','Tyndall AFB','Appointments and medical in-processing routing. Confirm the clinic and care team assigned to your household.','340 Magnolia Circle',[['Medical appointments','850-283-2778'],['Flight medicine','850-283-7984']],['dirTyndallList','dirAfFlorida']);
c('tySl','School Liaison','Tyndall / Bay County','School transfers, district contacts and education questions during the move. Confirm the meeting location directly.','445 Suwannee Road, Building 662',[['Program page contact','850-247-5253'],['Directory office line','850-283-2201']],['dirTyndallSl','dirAfFlorida'],{email:'325fss.fsys.slo@us.af.mil'});
c('tyCdc','Child Development Center','Tyndall AFB','Childcare applications, waitlists and placement questions. Ask which facility and age group apply before visiting.','510 Mississippi Road, Building 1500M',[['CDC','850-283-2205'],['Alternate','850-283-2204']],['dirTyndallCdc']);
c('tyYouth','Youth programs','Tyndall AFB','School-age and youth activity information. Ask about enrollment, transport and newcomer participation.','2700 Sabre Drive',[['Youth Center','850-283-2220']],['dirTyndallList','dirAfFlorida']);
c('tyEfmp','Exceptional Family Member Program','Tyndall AFB','Ask for family-support coordination and the correct medical referral if needed. School services use separate district processes.','Call for the EFMP meeting location.',[['EFMP','850-283-7656']],['dirTyndallList']);
c('tyChapel','Chaplain / religious support','Tyndall AFB','Spiritual support and chaplain appointments. Confirm the appropriate location and after-hours process.','Call for the current chapel office location.',[['Chapel','850-283-3397']],['dirTyndallList']);
c('tyRec','Outdoor recreation','Tyndall AFB','Recreation orientation, equipment and outdoor activity questions. Verify current access and reservations.','2699 Falcon Street, Beacon Beach Marina',[['Outdoor recreation','850-283-2255']],['dirAfFlorida']);

c('pcDuty','NSA command duty officer','NSA Panama City','For installation-level arrival routing when directed by your orders or sponsor. NDSTC, NEDU and NSWC Panama City assignments have their own command instructions.','Command mailing address: 101 Vernon Avenue, Panama City Beach, FL 32407',[['Command Duty Officer','850-625-1355']],['dirNsa']);
c('pcDive','NDSTC: Navy dive students','NSA Panama City','For orders naming Naval Diving and Salvage Training Center. Check in with the quarterdeck, then follow Student Control guidance for your course.','350 South Crag Road, Building 350; Student Control Room 103',[['Quarterdeck','850-234-4651'],['After-hours OOD','850-596-0499']],['dirDive','dirDiveNavy']);
c('pcAf','NDSTC: Air Force dive training','NSA Panama City','Air Force dive students use their course-specific instructions and Military Training Leader. Different dive courses have different reporting requirements.','350 South Crag Road; Air Force section, second floor',[['Military Training Leader','850-235-5260']],['dirDiveAf'],{caveat:'This is the dive-training route, not the Air Force CSO school at NAS Pensacola.'});
c('pcMarine','NDSTC: Marine combatant divers','NSA Panama City','Marine course questions and arrival coordination. Request the current course checklist; confirm required documents through the approved channel.','350 South Crag Road, Panama City Beach, FL 32407',[['Marine course desk','850-230-7051']],['dirDiveMarine'],{email:'NDSTC_PNMA_USMC-WEB@navy.mil'});
c('pcVcc','Visitor control / ID office','NSA Panama City','Call for access sponsorship, current ID services and the actual entrance to use. Confirm the visit location before driving.','NSA Panama City Visitor Control Center',[['VCC / ID office','850-235-5318']],['dirNsa']);
c('pcHousing','Government housing office','NSA Panama City','Housing eligibility, community referrals and lease questions. This is the government office, separate from privatized leasing.','101 Vernon Avenue, Building 386',[['Housing Service Center','850-234-4248']],['dirNsaHousing'],{email:'PanamaCity_Housing@us.navy.mil'});
c('pcUh','Unaccompanied housing','NSA Panama City','Barracks eligibility and assignment questions. Your course and orders determine the appropriate lodging category.','Call for your assigned building and check-in desk.',[['Unaccompanied housing','850-230-7231'],['Alternate','850-230-7299']],['dirNsaHousing']);
c('pcInn','Temporary lodging','NSA Panama City','The NDSTC reporting page gives this lodging contact. Confirm your reservation and exact vehicle entrance; a mailing address may not route to the gate.','Confirm the reception address on your reservation.',[['Installation lodging','850-588-0753']],['dirDiveNavy']);
c('pcFfsc','Fleet and Family Support Center','NSA Panama City','Relocation, spouse employment, family support and financial counseling. The service page and installation directory publish different numbers.','101 Vernon Avenue, Building 387',[['FFSC program page','850-230-7300'],['Installation directory alternate','850-235-5800']],['dirNsaFfsc','dirNsa'],{caveat:'Call to confirm the current office before visiting.'});
c('pcClinic','Branch Health Clinic','Off installation clinic location','Medical appointments and care-team routing. This clinic address is separate from NSA’s Vernon Avenue command address.','2500 Veterans Way, Building 645, Panama City, FL 32408',[['Clinic / administration','850-636-9400'],['Central appointments','850-505-7000']],['dirNsaClinic']);
c('pcDental','Branch clinic dental','Off installation clinic location','Dental appointments and dental in-processing questions. Confirm eligibility and the required records with the clinic.','2500 Veterans Way, Building 645, Panama City, FL 32408',[['Dental','850-636-9404']],['dirNsaClinic']);
c('pcSl','School Liaison: all services','NSA Panama City','School transfers, district navigation and youth transition support. Confirm the assigned school for the home address.','101 Vernon Avenue, Building 126',[['School Liaison','850-238-9830']],['dirNsaSl'],{email:'PanamaCitySL@us.navy.mil'});
c('pcYouth','Child and youth programs','NSA Panama City','Ask about the appropriate childcare, school-age or teen program and enrollment process. Confirm the facility for the requested program.','Youth programs: 101 Vernon Avenue, Building 632',[['CYP front desk','850-234-4938']],['dirNsaYouth','dirNsa']);
c('pcChapel','Chaplain / religious support','NSA Panama City','Spiritual support and chaplain appointments. Call for the meeting location or current duty coverage.','NSA Panama City; confirm office location.',[['Chaplain office','850-234-4084']],['dirNsaChapel']);
c('pcMwr','Recreation / local orientation','NSA Panama City','MWR activity information and facility routing. Ask about current programs, access and reservation requirements.','NSA Panama City MWR; call for the relevant facility.',[['MWR','850-234-4374']],['dirNsa']);
c('pcSecurity','Security: routine questions','NSA Panama City','For routine installation security questions. For an emergency, call 911 and give your location and installation name.','NSA Panama City; call before visiting.',[['Security','850-625-5013']],['dirNsa']);

export function telephoneHref(number){
 const match=number.match(/^(\d{3})-(\d{3})-(\d{4})(?: (ext\.|option) (\d+))?$/);
 if(!match)throw new Error('Unsupported directory phone: '+number);
 return `tel:+1${match[1]}${match[2]}${match[3]}`+(match[4]==='ext.'?`;ext=${match[5]}`:'');
}
export function contactStrings(b){return [b.title,b.scope,b.purpose,b.location,b.email,b.caveat,...b.phones.flatMap(p=>[p.label,p.number])].filter(Boolean);}
const commonNote='Public office sources checked September 7, 2026. Call before travel; orders and gaining-unit instructions control. Phone calls were not placed. Use approved secure channels for personal records.';
function directory(title,deck,ids,extra={}){
 const blocks=ids.map(id=>{if(!contacts[id])throw new Error('Missing contact '+id);return contacts[id];});
 return {...page(title,deck,blocks,[...new Set(blocks.flatMap(b=>b.sourceIds))]),kind:'directory',reviewed:DIRECTORY_REVIEWED,directoryNote:commonNote,...extra};
}
const reportDeck='Find the desk named on your orders. Rank alone does not identify the correct reporting route.';
const familyDeck='Save these contacts for schools, care, family support and getting settled. Check the location before each trip.';
const pensacolaCare=['nasSl','corryCdc','corryYouth','nh','nasEfmp','nasRelief'];
const movingDeck='Housing, transportation and administrative contacts. Shared offices are labeled with their actual installation.';
export const baseDirectories={
 'nas-pensacola':[
  directory('Choose your training route',reportDeck,['nasc','cso','nattc','vt10','vt4','vt86']),
  directory('Report and in-process','Use your gaining command first, then confirm the administrative services you need.',['nasDuty','matsg','nasId','nasRsc','nasGate','nasHhg']),
  directory('Housing and arrival support',movingDeck,['nasHousing','nasLodge','nasInn','nasUh','nasFfsc','nasRelief']),
  directory('Schools, care and family support',familyDeck,['nasSl','corryCdc','nasCdc','nh','nasEfmp','nasLegal'])
 ],
 'corry-station':[
  directory('Your Corry reporting contacts',reportDeck,['corryDuty','corryStudent','corryStaff','corryMarine','corryBeq','nasId']),
  directory('Move-in and shared NAS services','Corry and NAS main are separate destinations. Other-service personnel follow their gaining-service instructions.',['nasHousing','nasHhg','nasRsc','nasFfsc','nasLegal','nasGate']),
  directory('Family and everyday support',familyDeck,pensacolaCare)
 ],
 'saufley-field':[
  directory('Saufley: find the right desk','Confirm the tenant command and worksite first. Several support offices require a separate trip to NAS Pensacola.',['saufleyWork','netpdc','dantes','milgears','nasId','nasRsc']),
  directory('Move-in and shared NAS services','These shared offices are not physically on Saufley Field. Confirm the location and eligibility before traveling.',['nasHousing','nasHhg','nasGate','nasLodge','nasFfsc','nasLegal']),
  directory('Family and everyday support','The offices below serve the wider Pensacola area. Their location labels help you plan the separate trips.',pensacolaCare)
 ],
 'nas-whiting-field':[
  directory('Whiting: reporting and training',reportDeck,['whDuty','whFlight','whMarine','whTech','whId','whStaff']),
  directory('Housing and arrival support',movingDeck,['whHousing','whUh','whHhg','whFfsc','whSecurity']),
  directory('Family and everyday support',familyDeck,['whClinic','whCdc','whSl','nasLegal','nasRelief'])
 ],
 'eglin-afb':[
  directory('Eglin: reporting and arrival','Start with your gaining unit and sponsor. Tenant commands and schools may have separate reporting locations.',['egMpf','egFinance','egHhg','egHousing','egDorm','egInn']),
  directory('Unit and newcomer support','Specialized training, personal administration and orientation contacts for settling into the assignment.',['egF35','egLegal','egMfrc','egEducation','egChapel']),
  directory('Family and everyday support',familyDeck,['egMedical','egSl','egCdc','egYouth','egRec'])
 ],
 'hurlburt-field':[
  directory('Hurlburt: reporting and arrival','Coordinate arrival with your unit sponsor or command support staff (CSS), then complete the services that apply to you.',['huMpf','huFinance','huHhg','huHousing','huDorm','huInn']),
  directory('Personal and family support',familyDeck,['huLegal','huEducation','huMfrc','huMedical','huChapel']),
  directory('Schools, childcare and recreation','Confirm your program, its actual facility and enrollment requirements before planning the daily route.',['huSl','huCdc','huCdcWest','huYouth','huItt'])
 ],
 'duke-field':[
  directory('Duke: reporting and local contacts','Your gaining unit and duty status determine the arrival process. Confirm drill, active-duty or PCS instructions before travel.',['duMpf','duId','duFinance','duMfrc','duInn','duFss']),
  directory('Shared services: the Eglin trip','These offices are at Eglin, not Duke. Confirm eligibility, appointment location and unit routing before driving.',['egHousing','egHhg','egLegal','egMedical']),
  directory('Family resources at Eglin','Plan these separate trips around your Duke assignment and the programs your household can use.',['egSl','egCdc','egYouth','egChapel'])
 ],
 'tyndall-afb':[
  directory('Tyndall: reporting and arrival','Start with your sponsor and gaining unit. Confirm current counters and gates before using older arrival directions.',['tyMpf','tyFinance','tyHhg','tyHousing','tyInn','tyVcc']),
  directory('Personal and unit support',familyDeck,['tyLegal','tyCommand','tyMfrc','tyMedical','tyChapel']),
  directory('Schools, care and local resources','School and childcare offices can help bridge the move. Confirm appointments, program locations and enrollment.',['tySl','tyCdc','tyYouth','tyEfmp','tyRec'])
 ],
 'nsa-panama-city':[
  directory('NSA: reporting and training contacts','NSA Panama City is separate from Tyndall. Follow the school or tenant command named on your orders.',['pcDuty','pcDive','pcAf','pcMarine','pcVcc']),
  directory('Housing, care and arrival support',movingDeck,['pcHousing','pcUh','pcInn','pcFfsc','pcClinic','pcDental']),
  directory('Family and everyday support',familyDeck,['pcSl','pcYouth','pcChapel','pcMwr','pcSecurity'])
 ]
};
export function directoryPages(slug){if(!baseDirectories[slug])throw new Error('Missing base directory: '+slug);return baseDirectories[slug];}
for(const b of Object.values(contacts)){
 if(!b.sourceIds.length)throw new Error('Unsourced directory contact: '+b.contactId);
 for(const id of b.sourceIds)if(!directorySources[id])throw new Error('Missing directory authority: '+id);
 for(const p of b.phones)telephoneHref(p.number);
 if(b.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))throw new Error('Invalid published email: '+b.contactId);
}
