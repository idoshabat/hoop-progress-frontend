export function getDisplayInitial(firstName?: string | null, username?: string | null) {
  const firstNameInitial = firstName?.trim().charAt(0);
  if (firstNameInitial) {
    return firstNameInitial.toUpperCase();
  }

  const usernameInitial = username?.trim().charAt(0);
  if (usernameInitial) {
    return usernameInitial.toUpperCase();
  }

  return "?";
}
