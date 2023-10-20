module.exports.rounder = (method, num, n, zeroPadding = false) => {
  const pow = Math.pow(10, n);
  let result;
  switch (method) {
    case 'floor':
      result = Math.floor(num * pow) / pow;
      break;
    case 'ceil':
      result = Math.ceil(num * pow) / pow;
      break;
    case 'round':
      result = Math.round(num * pow) / pow;
      break;
    default:
      throw new Error('Invalid rounding method specified.');
  }
  if (zeroPadding) {
    return result.toFixed(n);
  } else {
    return result;
  }
}