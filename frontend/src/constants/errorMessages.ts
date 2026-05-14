import i18next from 'i18next'

export function getErrorMessage(code: string): string {
  const key = `error.${code}`
  return i18next.t(key, { defaultValue: i18next.t('error.UNKNOWN') })
}
