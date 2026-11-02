export function validateAuth(values, mode) {
  const errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (mode === "register" && values.name.trim().length < 2) errors.name = "Enter your full name (at least 2 characters).";
  if (mode !== "forgot") {
    if (values.password.length < 8) errors.password = "Use at least 8 characters.";
    if (mode === "register") {
      if (values.password.length >= 8 && !/(?=.*[A-Za-z])(?=.*\d)/.test(values.password)) errors.password = "Include at least one letter and one number.";
      if (values.confirm !== values.password) errors.confirm = "Passwords do not match.";
    }
  }
  return errors;
}
