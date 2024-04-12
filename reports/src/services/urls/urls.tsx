import { RemoveTrailingSlash } from '../utils'
const BASE_URL = RemoveTrailingSlash(import.meta.env.VITE_API_BASE_URL)

export const GET_GRIDS_DATA = `${BASE_URL}/devices/grids`
export const GET_REPORT_DATA = `${BASE_URL}/analytics/grid/report`
export const SHARE_REPORT = `${BASE_URL}/users/emailReport`
