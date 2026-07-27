/** Versões injetadas no build (vite.config.ts). Fallback se o define falhar. */
export type MexVersions = {
  admin: string
  mobile: string
  mobileRuntime: string
  connect: string
  landing: string
}

declare const __MEX_VERSIONS__: MexVersions | undefined

const FALLBACK: MexVersions = {
  admin: '—',
  mobile: '—',
  mobileRuntime: '—',
  connect: '—',
  landing: '—',
}

export function getMexVersions(): MexVersions {
  try {
    if (typeof __MEX_VERSIONS__ !== 'undefined' && __MEX_VERSIONS__) {
      return { ...FALLBACK, ...__MEX_VERSIONS__ }
    }
  } catch {
    // ignore
  }
  return FALLBACK
}
