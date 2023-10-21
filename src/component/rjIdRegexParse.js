module.exports = function rjIdRegexParse (input) {
  if (!isNaN(input) && input < 100000000) {
    if (input < 1000000) {
      output = input.toString().padStart(6, '0');
    } else {
      output = input.toString().padStart(8, '0');
    }
  } else {
    return null;
  }
  let obj = {
    raw: input,
    parsed: output
  };
  return obj;
}