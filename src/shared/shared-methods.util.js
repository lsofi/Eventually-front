import jwt from 'jwt-decode';

export function mongoDateToLocalDate (date) {
    const year = date.split('-')[0];
    const month = date.split('-')[1];
    const day = date.split('-')[2];
    return `${day}/${month}/${year}`;
}

export function getRanHex(size) {
    let result = [];
    let hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];  
    for (let n = 0; n < size; n++) {
      result.push(hexRef[Math.floor(Math.random() * 16)]);
    }
    return result.join('');
}

export function userIsInArray (user, userArray) {
  return userArray.findIndex(element => element.user_id === user.user_id) != -1;
}

export function getMyUserId () {
  return jwt(localStorage.getItem('token')).sub;
}

export function getMyUserName() {
  return jwt(localStorage.getItem('token')).username
}

export function getMySubscriptionType () {
  const token = localStorage.getItem('token')
  if (!token) return;
  return jwt(localStorage.getItem('token')).subscriptionType;
}

export function getFormattedSize (size) {
  // Receives as params a size in bytes, returns the size formatted as KB or MB
  if(size >= 1e6) return `${(Math.round(size/10000))/100} MB`
  else return `${(Math.round(size/10))/100} KB`
}

export function range(start, stop, step){
  return Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
}