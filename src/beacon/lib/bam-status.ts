export interface BamStatusDefinition {
  code: number
  description: string
  cause: string
}

export interface DecodedBamIssue {
  code: number
  description: string
  cause: string
}

export const BAM_STATUS_DEFINITIONS: BamStatusDefinition[] = [
  {
    code: 1,
    description: "Tape Break",
    cause: "No tape movement was detected during the tape move process.",
  },
  {
    code: 2,
    description: "Beta Detector",
    cause: "The beta detector count rate is less than 500 Hz during the sampling cycle.",
  },
  {
    code: 4,
    description: "Sensor Range",
    cause: "An analog sensor reading (AT, RH, BP, UPPER, LOWER, FT, FRH) is outside the designated limits.",
  },
  {
    code: 8,
    description: "Tape Advance",
    cause: "The pressure drop across the tape exceeded the Tape Advance Pressure setting.",
  },
  {
    code: 16,
    description: "Flow Failure",
    cause: "Sample flow is less than 1.0 SLPM for >1 minute, or +/-10% out of regulation for 1 minute, or +/-5% out of regulation for 5 minutes.",
  },
  {
    code: 32,
    description: "Nozzle Failure",
    cause: "The nozzle failed to move/stop at the up or down position, or the foil device is still inserted at start of operation.",
  },
  {
    code: 64,
    description: "Digital Link Failure",
    cause: "Communication with the 597A sensor has ceased for greater than 10 seconds.",
  },
  {
    code: 128,
    description: "Power Failure",
    cause: "A power cycle or micro-processor reset occurred.",
  },
  {
    code: 256,
    description: "Short Sample",
    cause: "The first sample cycle is less than 1 hour.",
  },
  {
    code: 512,
    description: "Maintenance",
    cause: "The user stopped normal operation.",
  },
]

const SORTED_DEFINITIONS = [...BAM_STATUS_DEFINITIONS].sort((a, b) => a.code - b.code)

export function decodeBamStatusIssues(status: unknown): DecodedBamIssue[] {
  const numericStatus = Number(status)

  if (!Number.isFinite(numericStatus)) {
    return []
  }

  const roundedStatus = Math.round(numericStatus)
  const isIntegerLike = Math.abs(roundedStatus - numericStatus) < 0.0001

  if (!isIntegerLike || roundedStatus <= 0) {
    return []
  }

  const issues = SORTED_DEFINITIONS.filter((entry) => (roundedStatus & entry.code) === entry.code)

  if (issues.length > 0) {
    return issues
  }

  return [
    {
      code: roundedStatus,
      description: `Unknown status code ${roundedStatus}`,
      cause: "Code not found in configured BAM status definitions.",
    },
  ]
}
