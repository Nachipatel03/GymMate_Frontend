export const isEmailValid = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isPhoneValid = (phone) =>
  /^[0-9]{10,15}$/.test(phone);