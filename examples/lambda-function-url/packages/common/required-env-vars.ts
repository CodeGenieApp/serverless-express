export function getMissingEnvVars(requiredEnvVars: string[], envVars = process.env) {
  return requiredEnvVars.filter(v => !envVars[v])
}

export function hasRequiredEnvVars(requiredEnvVars: string[]) {
  return getMissingEnvVars(requiredEnvVars).length === 0
}

export function assertHasRequiredEnvVars(requiredEnvVars: string[]) {
  const missingEnvVars = getMissingEnvVars(requiredEnvVars)
  
  if (missingEnvVars.length > 0) {
    throw new Error(getMissingEnvVarsMessage(missingEnvVars))
  }
}

export const getMissingEnvVarsMessage = (missingEnvVars: string[]) => `Missing environment variables: ${missingEnvVars.join(', ')}`