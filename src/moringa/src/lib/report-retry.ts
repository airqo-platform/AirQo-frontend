export const REPORT_REQUEST_RETRIES = 3
export const REPORT_RETRY_DELAY_MS = 5_000

type RetryOptions = {
  retries?: number
  delayMs?: number
}

const wait = (delayMs: number) => new Promise<void>((resolve) => window.setTimeout(resolve, delayMs))

export async function retryReportRequest<T>(
  request: () => Promise<T>,
  { retries = REPORT_REQUEST_RETRIES, delayMs = REPORT_RETRY_DELAY_MS }: RetryOptions = {},
): Promise<T> {
  let retryNumber = 0

  while (true) {
    try {
      return await request()
    } catch (error) {
      if (retryNumber >= retries) throw error

      retryNumber += 1
      await wait(delayMs)
    }
  }
}
