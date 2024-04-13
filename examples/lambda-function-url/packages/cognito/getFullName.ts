// Google SAML doesn't allow mapping the full name field, so we instead must construct
// this ourselves based on Given Name and Family Name.
export default function getFullName({ name, givenName, familyName}) {
  let fullName = name

  // If the name is JUST the given name, AND a family name exists: concatenate them into full name.
  // This is especially useful in Google SAML where it doesn't include a full name attribute.
  if (givenName && familyName && (!fullName || fullName === givenName)) {
    fullName = `${givenName} ${familyName}`
  } else if (!fullName) {
    fullName = givenName || familyName
  }

  return fullName
}