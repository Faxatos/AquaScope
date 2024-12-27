// This file contains placeholder data that you'll be replacing with real data in the Data Fetching chapter:
// https://nextjs.org/learn/dashboard-app/fetching-data
const users = [
  {
    id: '410544b2-4001-4271-9855-fec4b6a6442a',
    name: 'User',
    email: 'test@test.com',
    password: 'test123',
  },
];

const vessels = [
  {
    mmsi: 644739546,
    imo: 5266320,
    callsign: '1FD01DC',
    a: 23,
    b: 12,
    c: 17,
    d: 12,
    draught: 8.3,
  },
  {
    mmsi: 408444930,
    imo: 1131077,
    callsign: 'CFBC064',
    a: 31,
    b: 31,
    c: 14,
    d: 10,
    draught: 8.9,
  },
  {
    mmsi: 720946815,
    imo: 3561321,
    callsign: '0CC61E8',
    a: 49,
    b: 49,
    c: 9,
    d: 13,
    draught: 12.2,
  },
  {
    mmsi: 141875316,
    imo: 6581085,
    callsign: '34497A9',
    a: 40,
    b: 36,
    c: 20,
    d: 13,
    draught: 11.3,
  },
  {
    mmsi: 411095792,
    imo: 3212702,
    callsign: 'E9F3806',
    a: 23,
    b: 10,
    c: 18,
    d: 11,
    draught: 10.3,
  },
  {
    mmsi: 165078446,
    imo: 7709378,
    callsign: 'FED18DE',
    a: 29,
    b: 46,
    c: 7,
    d: 13,
    draught: 16.6,
  },
  {
    mmsi: 347742876,
    imo: 8888376,
    callsign: '4C05019',
    a: 44,
    b: 44,
    c: 14,
    d: 17,
    draught: 11.9,
  },
  {
    mmsi: 422062799,
    imo: 1505667,
    callsign: 'B02E5F8',
    a: 41,
    b: 34,
    c: 16,
    d: 8,
    draught: 8.8,
  },
  {
    mmsi: 831630275,
    imo: 4676744,
    callsign: 'F4C7636',
    a: 22,
    b: 29,
    c: 17,
    d: 13,
    draught: 14.7,
  },
  {
    mmsi: 208775030,
    imo: 9234743,
    callsign: 'A3EB819',
    a: 36,
    b: 16,
    c: 10,
    d: 9,
    draught: 10.2,
  },
];

const vesselLogs = [
  {
    timestamp: '2024-12-22T10:37:09.394932+00:00',
    mmsi: 644739546,
    locode: 'LOC-71',
    zone: 'Zone-2',
    eca: true,
    src: 'SAT',
    latitude: -10.547538,
    longitude: -108.503859,
    course: 92,
    speed: 11.49,
    eta_ais: '2024-12-22T15:46:22.715844+00:00',
    dest_lat: -9.578888,
    dest_lon: -108.695845,
  },
  {
    timestamp: '2024-12-22T10:37:09.394992+00:00',
    mmsi: 408444930,
    locode: 'LOC-89',
    zone: 'Zone-10',
    eca: true,
    src: 'SAT',
    latitude: -79.056829,
    longitude: -63.896155,
    course: 54,
    speed: 6.18,
    eta_ais: '2024-12-22T14:06:23.826896+00:00',
    dest_lat: -78.717382,
    dest_lon: -64.505067,
  },
  {
    timestamp: '2024-12-22T10:37:09.395041+00:00',
    mmsi: 720946815,
    locode: 'LOC-53',
    zone: 'Zone-3',
    eca: false,
    src: 'SAT',
    latitude: -33.729428,
    longitude: -155.314449,
    course: 104,
    speed: 18.54,
    eta_ais: '2024-12-22T13:10:08.402962+00:00',
    dest_lat: -33.694249,
    dest_lon: -154.368849,
  },
  {
    timestamp: '2024-12-22T10:37:09.395087+00:00',
    mmsi: 141875316,
    locode: 'LOC-1',
    zone: 'Zone-10',
    eca: false,
    src: 'SAT',
    latitude: -32.445114,
    longitude: -167.23132,
    course: 272,
    speed: 12.31,
    eta_ais: '2024-12-22T16:42:05.669866+00:00',
    dest_lat: -33.386297,
    dest_lon: -168.206284,
  },
  {
    timestamp: '2024-12-22T10:37:09.395135+00:00',
    mmsi: 411095792,
    locode: 'LOC-27',
    zone: 'Zone-2',
    eca: true,
    src: 'SAT',
    latitude: -67.759792,
    longitude: -81.806019,
    course: 90,
    speed: 7.26,
    eta_ais: '2024-12-22T14:31:15.062205+00:00',
    dest_lat: -67.295997,
    dest_lon: -82.037689,
  },
  {
    timestamp: '2024-12-22T10:37:09.395183+00:00',
    mmsi: 165078446,
    locode: 'LOC-78',
    zone: 'Zone-9',
    eca: true,
    src: 'SAT',
    latitude: -31.009451,
    longitude: -156.284795,
    course: 247,
    speed: 18.35,
    eta_ais: '2024-12-22T12:48:44.258295+00:00',
    dest_lat: -31.61915,
    dest_lon: -156.61128,
  },
  {
    timestamp: '2024-12-22T10:37:09.395228+00:00',
    mmsi: 347742876,
    locode: 'LOC-33',
    zone: 'Zone-8',
    eca: true,
    src: 'SAT',
    latitude: -67.374282,
    longitude: -107.21429,
    course: 32,
    speed: 13.13,
    eta_ais: '2024-12-22T13:49:32.107775+00:00',
    dest_lat: -66.679834,
    dest_lon: -106.965039,
  },
  {
    timestamp: '2024-12-22T10:37:09.395274+00:00',
    mmsi: 422062799,
    locode: 'LOC-35',
    zone: 'Zone-1',
    eca: false,
    src: 'SAT',
    latitude: 45.572861,
    longitude: -172.73313,
    course: 3,
    speed: 6.13,
    eta_ais: '2024-12-22T18:47:24.512537+00:00',
    dest_lat: 45.05828,
    dest_lon: -171.798558,
  },
  {
    timestamp: '2024-12-22T10:37:09.395320+00:00',
    mmsi: 831630275,
    locode: 'LOC-98',
    zone: 'Zone-8',
    eca: false,
    src: 'SAT',
    latitude: 56.315807,
    longitude: -136.329912,
    course: 178,
    speed: 13.75,
    eta_ais: '2024-12-22T15:13:56.171475+00:00',
    dest_lat: 55.32708,
    dest_lon: -135.667282,
  },
  {
    timestamp: '2024-12-22T10:37:09.395367+00:00',
    mmsi: 208775030,
    locode: 'LOC-52',
    zone: 'Zone-7',
    eca: false,
    src: 'SAT',
    latitude: 73.481881,
    longitude: -124.426785,
    course: 144,
    speed: 10.99,
    eta_ais: '2024-12-22T12:15:48.981127+00:00',
    dest_lat: 73.230529,
    dest_lon: -123.848698,
  },
];

const alarms = [
  {
    timestamp: '2024-12-22T10:37:09.394932+00:00',
    alarm_id: 'ALARM001',
    mmsi: 644739546,
    code: 'ENGINE_ERR',
    description: 'Engine malfunction detected',
    status: "active",
  },
  {
    timestamp: '2024-12-22T10:37:09.394992+00:00',
    alarm_id: 'ALARM002',
    mmsi: 408444930,
    code: 'NAV_WARN',
    description: 'Navigational hazard warning',
    status: "resolved",
  }
];

export { users, vessels, vesselLogs, alarms };
