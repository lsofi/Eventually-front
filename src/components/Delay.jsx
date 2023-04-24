// Usefull for using delays in code while testing.
export default function Delay(ms){ return new Promise(res => setTimeout(res, ms))};