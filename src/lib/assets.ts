/** Caminhos de assets estáticos (respeita base `/admin/` do Vite). */
export function adminAsset(path: string): string {
  const clean = path.replace(/^\//, '')
  return `${import.meta.env.BASE_URL}${clean}`
}

export const MEX_HUB_LOGO_SVG = adminAsset('assets/mex-hub-logo.svg')
export const MEX_APP_ICON_PNG = adminAsset('assets/icons/icon.png')
