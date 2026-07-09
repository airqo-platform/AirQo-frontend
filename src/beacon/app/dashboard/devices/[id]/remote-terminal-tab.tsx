"use client"

import React, { useEffect, useRef, useState } from "react"
import { Terminal as XTerm } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { config } from "@/lib/config"
import authService from "@/services/api-service"
import {
  TerminalIcon,
  Trash2,
  Cpu,
  Users,
  ShieldAlert,
  Play,
  Square,
  RefreshCw,
  Usb,
  Unplug,
  Wifi,
  Download,
  AlertTriangle,
  History,
  CornerDownLeft,
  Send,
  UploadCloud,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Local IoT Connection imports
import { useIotStore } from "@/store/useIotStore"
import { useDeviceConnection } from "@/hooks/iot/useDeviceConnection"
import { useLocalAgentWatcher } from "@/hooks/iot/useLocalAgentWatcher"
import firmwareService from "@/services/firmware.service"
import { FirmwareVersion } from "@/types/firmware.types"

// Collaboration & WebRTC imports
import { useCollaborationStore } from "@/store/useCollaborationStore"
import { sessionManager } from "@/services/iot/collaboration/SessionManager"
import { deviceGateway } from "@/services/iot/collaboration/DeviceGateway"
import { permissionManager } from "@/services/iot/collaboration/PermissionManager"
import { peerManager } from "@/services/iot/collaboration/PeerManager"
import { telemetryManager } from "@/services/iot/collaboration/TelemetryManager"
import {
  Lock,
  Unlock,
  Activity,
  Copy,
  Check,
  ShieldAlert as ShieldAlertIcon,
  WifiOff,
  Thermometer,
  Droplets,
  Wind,
  Battery
} from "lucide-react"

interface CommandParamSchema {
  type: string
  description?: string
  required?: boolean
  default?: any
}

interface CommandDef {
  id: string
  name: string
  description: string
  dangerous: boolean
  requires_confirmation: boolean
  parameter_schema: Record<string, CommandParamSchema> | null
}

interface JobState {
  job_id: string
  status: string
  progress: number
}

interface RemoteTerminalTabProps {
  deviceId: string
  deviceName: string
  transmissionStatus?: string
}

const QUICK_COMMANDS = [
  { label: "Help", value: "help", description: "Show device help menu" },
  { label: "Status", value: "status", description: "Get current system status" },
  { label: "Reboot", value: "reboot", description: "Perform software reset" },
  { label: "Config", value: "config", description: "Print loaded settings" },
]

export default function RemoteTerminalTab({
  deviceId,
  deviceName,
  transmissionStatus,
}: RemoteTerminalTabProps) {
  // Mode selection: 'cloud' (FastAPI WebSocket) or 'local' (Web Serial/Local Agent)
  const [activeMode, setActiveMode] = useState<"cloud" | "local">("cloud")
  const { toast } = useToast()

  // ----------------------------------------------------
  // LOCAL USB MODE STATE & HOOKS
  // ----------------------------------------------------
  useLocalAgentWatcher() // Watch the local agent in the background
  const localStore = useIotStore()
  const { connectESP, connectArduino, disconnect } = useDeviceConnection()
  
  const [localComPort, setLocalComPort] = useState("")
  const [firmwareVersions, setFirmwareVersions] = useState<FirmwareVersion[]>([])
  const [selectedFirmware, setSelectedFirmware] = useState("")
  const [localFwFlashing, setLocalFwFlashing] = useState(false)
  const [localFwError, setLocalFwError] = useState<string | null>(null)
  const [showConfirmFlashModal, setShowConfirmFlashModal] = useState(false)

  // Local Command Input & History
  const [localCommand, setLocalCommand] = useState("")
  const [localHistory, setLocalHistory] = useState<string[]>([])
  const [localHistoryIdx, setLocalHistoryIdx] = useState<number | null>(null)
  const [localLineEnding, setLocalLineEnding] = useState("\r\n")

  // Auto-select local port
  useEffect(() => {
    if (localStore.availablePorts.length > 0 && !localComPort) {
      setLocalComPort(localStore.availablePorts[0].path)
    }
  }, [localStore.availablePorts, localComPort])

  // Fetch firmwares for local flashing
  useEffect(() => {
    const fetchFw = async () => {
      try {
        const versions = await firmwareService.getAllFirmwares({ limit: 100 })
        setFirmwareVersions(versions || [])
        if (versions && versions.length > 0) {
          setSelectedFirmware(versions[0].id)
        }
      } catch (e) {
        console.error("Failed to load firmware versions:", e)
      }
    }
    fetchFw()
  }, [])

  const selectedLocalFw = firmwareVersions.find(fw => fw.id === selectedFirmware)
  const isArduino = localStore.deviceInfo?.chipType === "Arduino"
  const isLocalFwCompatible = selectedLocalFw 
    ? (isArduino ? !!selectedLocalFw.firmware_string_hex : !!selectedLocalFw.firmware_string) 
    : false

  // Load local command history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("iot_command_history")
      if (stored) setLocalHistory(JSON.parse(stored))
    } catch (e) {
      console.warn("Failed to load command history", e)
    }
  }, [])

  const saveLocalHistory = (newHistory: string[]) => {
    setLocalHistory(newHistory)
    try {
      localStorage.setItem("iot_command_history", JSON.stringify(newHistory))
    } catch (e) {
      console.warn("Failed to save command history", e)
    }
  }

  // ----------------------------------------------------
  // COLLABORATION & WEBRTC STATE
  // ----------------------------------------------------
  const collabStore = useCollaborationStore()
  const [dbActiveCloudSession, setDbActiveCloudSession] = useState<any | null>(null)
  const [cloudCommands, setCloudCommands] = useState<CommandDef[]>([])
  const [selectedCloudCmdId, setSelectedCloudCmdId] = useState("")
  const [cloudCmdParams, setCloudCmdParams] = useState<Record<string, any>>({})
  const [cloudCmdConfirmed, setCloudCmdConfirmed] = useState(false)
  const [copiedSessionId, setCopiedSessionId] = useState(false)
  const [joinInputSessionId, setJoinInputSessionId] = useState("")

  const localSessionIdRef = useRef<string | null>(null)
  const [localSessionId, setLocalSessionId] = useState<string | null>(null)

  const selectedCloudCmd = cloudCommands.find((c) => c.id === selectedCloudCmdId)

  // Get current username
  const currentUser = authService.getUserData()
  const currentUsername = currentUser?.userName || currentUser?.firstName || currentUser?.email || "User"


  useEffect(() => {
    localSessionIdRef.current = localSessionId
  }, [localSessionId])

  // ----------------------------------------------------
  // TERMINAL REFERENCES
  // ----------------------------------------------------
  const cloudTermRef = useRef<HTMLDivElement>(null)
  const cloudXtermRef = useRef<XTerm | null>(null)

  const localTermRef = useRef<HTMLDivElement>(null)
  const localXtermRef = useRef<XTerm | null>(null)

  // ----------------------------------------------------
  // INITIALIZE CLOUD TERMINAL
  // ----------------------------------------------------
  useEffect(() => {
    if (activeMode !== "cloud" || !cloudTermRef.current) return

    const term = new XTerm({
      theme: {
        background: "#1e1e1e",
        foreground: "#d4d4d4",
        cursor: "#ffffff",
        selectionBackground: "#5c5c5c",
      },
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      cursorBlink: true,
      scrollback: 5000,
      disableStdin: true,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)

    let isOpened = false
    let resizeTimeout: NodeJS.Timeout

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          clearTimeout(resizeTimeout)
          resizeTimeout = setTimeout(() => {
            try {
              if (cloudTermRef.current?.clientWidth) {
                if (!isOpened) {
                  term.open(cloudTermRef.current)
                  cloudXtermRef.current = term
                  isOpened = true
                }
                fitAddon.fit()
              }
            } catch (e) {
              console.warn("xterm.js fit error:", e)
            }
          }, 50)
        }
      }
    })

    resizeObserver.observe(cloudTermRef.current)

    const handleResize = () => {
      try {
        if (isOpened && cloudTermRef.current && cloudTermRef.current.clientWidth > 0) {
          fitAddon.fit()
        }
      } catch (e) {}
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      resizeObserver.disconnect()
      clearTimeout(resizeTimeout)
      term.dispose()
      cloudXtermRef.current = null
    }
  }, [activeMode])

  // ----------------------------------------------------
  // INITIALIZE LOCAL TERMINAL
  // ----------------------------------------------------
  useEffect(() => {
    if (activeMode !== "local" || !localTermRef.current) return

    const term = new XTerm({
      theme: {
        background: "#1e1e1e",
        foreground: "#d4d4d4",
        cursor: "#ffffff",
        selectionBackground: "#5c5c5c",
      },
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      cursorBlink: true,
      scrollback: 5000,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)

    let isOpened = false
    let resizeTimeout: NodeJS.Timeout

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          clearTimeout(resizeTimeout)
          resizeTimeout = setTimeout(() => {
            try {
              if (localTermRef.current?.clientWidth) {
                if (!isOpened) {
                  term.open(localTermRef.current)
                  localXtermRef.current = term
                  isOpened = true

                  term.writeln("\x1b[32m[IoT Workbench] Local Serial Monitor initialized.\x1b[0m")
                  if (useIotStore.getState().status === "connected") {
                    term.writeln("\x1b[32m[Connected] Ready for local interaction.\x1b[0m")
                  } else {
                    term.writeln("\x1b[90mWaiting for local device connection...\x1b[0m")
                  }

                  // Write pre-existing local logs buffer
                  if (useIotStore.getState().logs.length > 0) {
                    term.write(useIotStore.getState().logs.join("").replace(/\n/g, "\r\n"))
                  }
                }
                fitAddon.fit()
              }
            } catch (e) {
              console.warn("xterm.js fit error:", e)
            }
          }, 50)
        }
      }
    })

    resizeObserver.observe(localTermRef.current)

    const handleResize = () => {
      try {
        if (isOpened && localTermRef.current && localTermRef.current.clientWidth > 0) {
          fitAddon.fit()
        }
      } catch (e) {}
    }
    window.addEventListener("resize", handleResize)

    // keyboard input to local adapter
    const dataListener = term.onData((data) => {
      const state = useIotStore.getState()
      if (state.status === "connected" && state.adapter) {
        state.adapter.write(data).catch((e) => {
          console.warn("Serial direct write error:", e)
        })
      }
    })

    return () => {
      window.removeEventListener("resize", handleResize)
      resizeObserver.disconnect()
      clearTimeout(resizeTimeout)
      dataListener.dispose()
      term.dispose()
      localXtermRef.current = null
    }
  }, [activeMode])

  // Sync local store logs to local terminal
  const localLogsLength = localStore.logs.length
  const localLogsRef = useRef(0)

  useEffect(() => {
    if (activeMode !== "local" || !localXtermRef.current) return

    // If logs were cleared
    if (localLogsLength === 0) {
      localLogsRef.current = 0
      return
    }

    if (localLogsLength > localLogsRef.current) {
      const newLogs = localStore.logs.slice(localLogsRef.current)
      try {
        localXtermRef.current.write(newLogs.join("").replace(/\n/g, "\r\n"))
        localLogsRef.current = localLogsLength
      } catch (e) {}
    }
  }, [localLogsLength, activeMode, localStore.logs])

  // ----------------------------------------------------
  // COLLABORATION & WEBRTC HANDLERS
  // ----------------------------------------------------
  const fetchCloudCommands = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/api/v1/commands`, {
        headers: { Authorization: authService.getToken() || "" },
      })
      if (res.ok) {
        const data = await res.json()
        setCloudCommands(data || [])
      }
    } catch (e) {
      console.error("Failed to fetch cloud commands:", e)
    }
  }

  const startCollaborationSession = async () => {
    try {
      await sessionManager.createHostSession(deviceId, currentUsername)
      toast({ title: "Collaboration Started", description: "Created P2P collaboration session." })
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to Start Session", description: err.message })
    }
  }

  const joinCollaborationSession = async () => {
    if (!joinInputSessionId.trim()) return
    try {
      await sessionManager.joinParticipantSession(joinInputSessionId, currentUsername)
      toast({ title: "Requested to Join", description: "Join request sent to Host." })
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to Join", description: err.message })
    }
  }

  const disconnectCollaborationSession = async () => {
    await sessionManager.disconnectSession()
    toast({ title: "Session Disconnected", description: "Left the collaboration session." })
  }

  const handleCopySessionId = () => {
    if (!collabStore.sessionId) return
    navigator.clipboard.writeText(collabStore.sessionId)
    setCopiedSessionId(true)
    setTimeout(() => setCopiedSessionId(false), 2000)
    toast({ title: "Copied!", description: "Session ID copied to clipboard." })
  }

  const handleRequestControl = () => {
    if (peerManager && collabStore.userId && collabStore.sessionId) {
      permissionManager.requestControl(collabStore.userId, currentUsername)
      peerManager.broadcast({
        type: "requestControl",
        payload: { userId: collabStore.userId, username: currentUsername }
      })
    }
  }

  const handleReleaseControl = () => {
    if (peerManager && collabStore.userId) {
      permissionManager.releaseControl(collabStore.userId, currentUsername)
      peerManager.broadcast({
        type: "releaseControl",
        payload: { userId: collabStore.userId, username: currentUsername }
      })
    }
  }

  const handleExecuteCollaborationCommand = async () => {
    if (!selectedCloudCmdId) return
    const cmdText = `${selectedCloudCmd?.name} ${JSON.stringify(cloudCmdParams)}`

    if (collabStore.role === "host") {
      await deviceGateway.executeCommand(cmdText, collabStore.userId || "host", currentUsername)
    } else {
      deviceGateway.sendParticipantCommand(cmdText)
    }
    setCloudCmdConfirmed(false)
  }

  // Sync physical connection logs with device gateway if host
  const localStatus = localStore.status
  const localAdapter = localStore.adapter
  const collabRole = collabStore.role

  useEffect(() => {
    if (collabRole === "host" && localStatus === "connected" && localAdapter) {
      deviceGateway.connectDevice(localAdapter)
    } else if (collabRole === "host" && localStatus === "disconnected") {
      deviceGateway.disconnectDevice()
    }
  }, [localStatus, localAdapter, collabRole])

  // Sync cloud collaboration store logs to cloud terminal
  const cloudLogs = collabStore.logs
  const cloudLogsLength = cloudLogs.length
  const cloudLogsRef = useRef(0)

  useEffect(() => {
    if (activeMode !== "cloud" || !cloudXtermRef.current) return

    if (cloudLogsLength === 0) {
      cloudLogsRef.current = 0
      return
    }

    if (cloudLogsLength > cloudLogsRef.current) {
      const newLogs = cloudLogs.slice(cloudLogsRef.current)
      try {
        cloudXtermRef.current.write(newLogs.join("").replace(/\n/g, "\r\n"))
        cloudLogsRef.current = cloudLogsLength
      } catch (e) {}
    }
  }, [cloudLogsLength, activeMode, cloudLogs])

  const startLocalSession = async () => {
    try {
      localStore.addLog(`\x1b[90mStarting local database session for device: ${deviceId}...\x1b[0m\r\n`)
      const res = await fetch(`${config.apiUrl}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authService.getToken() || "",
        },
        body: JSON.stringify({
          device_id: deviceId,
          session_type: "LOCAL",
        }),
      })

      if (!res.ok) {
        throw new Error(`Failed to create local session: ${res.statusText}`)
      }

      const sessionData = await res.json()
      const sid = sessionData.id || sessionData.session_id
      if (!sid) throw new Error("Invalid session data returned")

      setLocalSessionId(sid)
      localStore.addLog(`\x1b[32m[Session Started] Database session ID: ${sid}\x1b[0m\r\n`)
      toast({ title: "Session Started", description: "Your local debugging session has been recorded in the database." })
    } catch (e: any) {
      console.error(e)
      localStore.addLog(`\x1b[31m[Error] Failed to start database session: ${e.message}\x1b[0m\r\n`)
    }
  }

  const endLocalSession = async () => {
    if (!localSessionIdRef.current) return
    try {
      await fetch(`${config.apiUrl}/api/v1/sessions/${localSessionIdRef.current}`, {
        method: "DELETE",
        headers: {
          Authorization: authService.getToken() || "",
        },
      })
      localStore.addLog(`\x1b[33m[Session Ended] Database session closed\x1b[0m\r\n`)
      toast({ title: "Session Ended", description: "Database session successfully ended." })
    } catch (e: any) {
      console.error(e)
    } finally {
      setLocalSessionId(null)
    }
  }

  const handleLocalDisconnect = async () => {
    await endLocalSession()
    await disconnect()
  }

  const checkActiveSession = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/api/v1/devices/${deviceId}/active-session`, {
        headers: { Authorization: authService.getToken() || "" },
      })
      if (res.ok) {
        const data = await res.json()
        if (data && data.status === "ACTIVE") {
          if (data.session_type === "DEBUGGING") {
            // Found active session on backend
            setDbActiveCloudSession(data)
          } else if (data.session_type === "LOCAL") {
            setLocalSessionId(data.id)
          }
        }
      }
    } catch (e) {
      console.error("Failed to check active session:", e)
    }
  }

  useEffect(() => {
    fetchCloudCommands()
    checkActiveSession()

    return () => {
      // Disconnect collaboration on unmount
      sessionManager.disconnectSession().catch(() => {})

      // Terminate local session on unmount if active
      const activeLocalSid = localSessionIdRef.current
      if (activeLocalSid) {
        fetch(`${config.apiUrl}/api/v1/sessions/${activeLocalSid}`, {
          method: "DELETE",
          headers: {
            Authorization: authService.getToken() || "",
          },
        }).catch((err) => console.error("Failed to terminate local session on unmount:", err))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ----------------------------------------------------
  // LOCAL USB SERVICES METHODS
  // ----------------------------------------------------
  const handleLocalSend = async (cmdText: string) => {
    if (!cmdText.trim()) return

    if (localXtermRef.current) {
      localXtermRef.current.write(`\r\n\x1b[36m> ${cmdText}\x1b[0m\r\n`)
    }

    const filtered = localHistory.filter((h) => h !== cmdText)
    const newHist = [...filtered, cmdText].slice(-100)
    saveLocalHistory(newHist)
    setLocalHistoryIdx(null)

    if (localStore.adapter && localStore.status === "connected") {
      try {
        const payload = cmdText + (localLineEnding === "none" ? "" : localLineEnding)
        await localStore.adapter.write(payload)
      } catch (e: any) {
        if (localXtermRef.current) {
          localXtermRef.current.write(`\x1b[31m\r\n[Error] Failed to send: ${e.message}\x1b[0m\r\n`)
        }
      }
    } else {
      if (localXtermRef.current) {
        localXtermRef.current.write("\x1b[33m\r\n[Warning] Command not sent: Device is disconnected.\x1b[0m\r\n")
      }
    }
  }

  const handleLocalFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!localCommand) return
    handleLocalSend(localCommand)
    setLocalCommand("")
  }

  const handleLocalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (localHistory.length === 0) return

    if (e.key === "ArrowUp") {
      e.preventDefault()
      const nextIdx = localHistoryIdx === null ? localHistory.length - 1 : Math.max(0, localHistoryIdx - 1)
      setLocalHistoryIdx(nextIdx)
      setLocalCommand(localHistory[nextIdx])
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (localHistoryIdx === null) return
      const nextIdx = localHistoryIdx + 1
      if (nextIdx >= localHistory.length) {
        setLocalHistoryIdx(null)
        setLocalCommand("")
      } else {
        setLocalHistoryIdx(nextIdx)
        setLocalCommand(localHistory[nextIdx])
      }
    }
  }

  const handleLocalFlash = () => {
    if (!isLocalFwCompatible) {
      setLocalFwError("Selected firmware is not compatible with the connected device.")
      return
    }
    setShowConfirmFlashModal(true)
  }

  const executeLocalFlash = async () => {
    setShowConfirmFlashModal(false)
    if (!localStore.adapter || !selectedFirmware || !selectedLocalFw) return

    setLocalFwFlashing(true)
    setLocalFwError(null)

    try {
      const isArduino = localStore.deviceInfo?.chipType === "Arduino"
      if (isArduino && !selectedLocalFw.firmware_string_hex) {
        throw new Error("This firmware version does not have a HEX file available for Arduino.")
      } else if (!isArduino && !selectedLocalFw.firmware_string) {
        throw new Error("This firmware version does not have a BIN file available for ESP.")
      }

      localStore.setFlashProgress({ phase: "preparing", percentage: 5, message: "Downloading firmware..." })
      
      const fileType = isArduino ? "hex" : "bin"
      const firmwareUrl = firmwareService.getDownloadUrl({
        firmware_id: selectedLocalFw.id,
        file_type: fileType,
      })

      await localStore.adapter.flash(firmwareUrl, (progress) => {
        localStore.setFlashProgress(progress)
      })

      await localStore.adapter.reboot()
      toast({ title: "Local Flash Successful", description: "Firmware flashing completed successfully!" })
    } catch (err: any) {
      console.error(err)
      const msg = err.message || "Local flashing failed"
      setLocalFwError(msg)
      localStore.setFlashProgress({ phase: "error", percentage: 100, message: msg })
    } finally {
      setLocalFwFlashing(false)
    }
  }

  const handleClearTerm = () => {
    if (activeMode === "cloud" && cloudXtermRef.current) {
      cloudXtermRef.current.clear()
    } else if (activeMode === "local" && localXtermRef.current) {
      localXtermRef.current.clear()
      localStore.clearLogs()
    }
  }

  return (
    <div className="space-y-4">
      {/* Segmented Mode Selector Toggle */}
      <div className="flex bg-[#151515] p-1 rounded-md max-w-md border border-gray-800">
        <button
          onClick={() => setActiveMode("cloud")}
          className={`flex-1 flex items-center justify-center py-2 text-xs font-semibold rounded transition-colors ${
            activeMode === "cloud"
              ? "bg-[#2d2d2d] text-teal-400 shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Cpu className="w-3.5 h-3.5 mr-2" />
          Cloud Connection (Remote Session)
        </button>
        <button
          onClick={() => setActiveMode("local")}
          className={`flex-1 flex items-center justify-center py-2 text-xs font-semibold rounded transition-colors ${
            activeMode === "local"
              ? "bg-[#2d2d2d] text-teal-400 shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Usb className="w-3.5 h-3.5 mr-2" />
          USB Connection (Local Agent)
        </button>
      </div>

      <div className="flex flex-col lg:flex-row h-[720px] w-full bg-[#1e1e1e] rounded-md overflow-hidden border border-gray-800 shadow-xl font-sans text-gray-200">
        {/* ======================================================== */}
        {/* CLOUD COLLABORATION (WEBRTC) MODE UI */}
        {/* ======================================================== */}
        {activeMode === "cloud" && (
          <>
            {/* Left Pane: Cloud Logs Terminal */}
            <div className="flex flex-col flex-grow min-w-0 h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-gray-800">
              <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-800 select-none">
                <div className="flex items-center space-x-2 text-gray-300">
                  <TerminalIcon size={16} className="text-blue-400" />
                  <span className="text-sm font-medium">Collaboration Live Console</span>
                  {collabStore.sessionId ? (
                    <Badge variant="outline" className="bg-green-950 text-green-400 border-green-800 ml-2 animate-pulse h-5 text-[10px]">
                      WEBRTC ACTIVE
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-800 text-gray-400 border-gray-600 ml-2 h-5 text-[10px]">
                      OFFLINE
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearTerm}
                    className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-[#3d3d3d] rounded"
                    title="Clear Output"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div ref={cloudTermRef} className="flex-grow p-2 overflow-hidden bg-[#1e1e1e] w-full h-full" />
            </div>

            {/* Right Pane: Cloud Session & Collaboration Controls */}
            <div className="flex flex-col w-full lg:w-[380px] bg-[#151515] h-1/2 lg:h-full overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 bg-[#202020] border-b border-gray-800 sticky top-0 z-10 select-none">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Activity size={16} className="text-teal-400" />
                  <span className="text-sm font-medium">Collaboration Dashboard</span>
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* 1. Join Requests (Host Only) */}
                {collabStore.role === "host" && collabStore.joinRequests.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-wider text-amber-500 font-semibold flex items-center space-x-1.5">
                      <ShieldAlertIcon className="w-3.5 h-3.5 animate-bounce" />
                      <span>Pending Join Requests ({collabStore.joinRequests.length})</span>
                    </div>
                    <div className="space-y-2">
                      {collabStore.joinRequests.map((req) => (
                        <div key={req.userId} className="p-3 bg-amber-950/20 border border-amber-800/60 rounded-md flex flex-col gap-2">
                          <p className="text-xs text-gray-300">
                            <strong>{req.username}</strong> wishes to join your remote session.
                          </p>
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-gray-400 hover:text-white"
                              onClick={() => sessionManager.rejectJoinRequest(req)}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                              onClick={() => sessionManager.acceptJoinRequest(req)}
                            >
                              Accept & Connect
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Connection Settings / Status */}
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    Collaboration Connection
                  </div>
                  <Card className="bg-[#1a1a1a] border-gray-800 text-gray-300 shadow-none">
                    <CardContent className="p-4 space-y-4">
                      {collabStore.sessionId ? (
                        // Active Session Details
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Role:</span>
                            <Badge className={collabStore.role === "host" ? "bg-teal-600" : "bg-purple-600"}>
                              {collabStore.role === "host" ? "HOST / GATEWAY" : "PARTICIPANT"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">P2P Quality:</span>
                            <Badge variant="outline" className={
                              collabStore.connectionQuality === "excellent" ? "bg-green-950 text-green-400 border-green-800" :
                              collabStore.connectionQuality === "good" ? "bg-blue-950 text-blue-400 border-blue-800" :
                              collabStore.connectionQuality === "poor" ? "bg-red-950 text-red-400 border-red-800 animate-pulse" :
                              "bg-gray-800 text-gray-400 border-gray-650"
                            }>
                              {collabStore.connectionQuality.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] text-gray-500">Session Room ID</label>
                            <div className="flex items-center bg-[#242424] rounded-md px-2.5 py-1.5 border border-gray-850 justify-between">
                              <span className="text-xs font-mono truncate text-gray-300 max-w-[200px]">
                                {collabStore.sessionId}
                              </span>
                              <button
                                onClick={handleCopySessionId}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                {copiedSessionId ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>

                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                            onClick={disconnectCollaborationSession}
                          >
                            <Square size={14} className="mr-2" />
                            Disconnect Session
                          </Button>
                        </div>
                      ) : (
                        // Start/Join Session Form
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Button
                              size="sm"
                              className="w-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center"
                              disabled={collabStore.isConnecting}
                              onClick={startCollaborationSession}
                            >
                              <Play size={14} className="mr-2" />
                              {collabStore.isConnecting ? "Connecting..." : "Start Hosting Session"}
                            </Button>
                            {dbActiveCloudSession && (
                              <p className="text-[10px] text-teal-400 bg-teal-950/20 border border-teal-950/40 p-2 rounded">
                                Active session registry found on backend for this device.
                              </p>
                            )}
                          </div>

                          <div className="border-t border-gray-850 my-2 pt-2 space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-400">Join Session Room</Label>
                              <Input
                                placeholder="Enter Collaboration Room ID"
                                className="bg-[#242424] border-gray-850 text-xs h-9 text-white"
                                value={joinInputSessionId}
                                onChange={(e) => setJoinInputSessionId(e.target.value)}
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-purple-800 text-purple-400 hover:bg-purple-950/20 hover:text-white"
                              disabled={!joinInputSessionId.trim() || collabStore.isConnecting}
                              onClick={joinCollaborationSession}
                            >
                              <Users size={14} className="mr-2" />
                              Join Existing Room
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {collabStore.sessionId && (
                  <>
                    {/* 3. Control Lock Management */}
                    <div className="space-y-3">
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        Device Control Management
                      </div>
                      <Card className="bg-[#1a1a1a] border-gray-800 text-gray-300 shadow-none">
                        <CardContent className="p-4 space-y-3.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Status:</span>
                            {collabStore.currentControllerId === collabStore.userId ? (
                              <Badge className="bg-green-600 animate-pulse">YOU HAVE CONTROL</Badge>
                            ) : collabStore.currentControllerId ? (
                              <Badge className="bg-orange-600">LOCKED (REMOTE PEER)</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-800 text-gray-400">OBSERVER (READ-ONLY)</Badge>
                            )}
                          </div>

                          {collabStore.role === "participant" ? (
                            collabStore.currentControllerId === collabStore.userId ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-gray-700 text-gray-300 hover:bg-[#2d2d2d] hover:text-white"
                                onClick={handleReleaseControl}
                              >
                                <Unlock size={14} className="mr-2" /> Release Device Control
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-40"
                                onClick={handleRequestControl}
                                disabled={collabStore.currentControllerId !== null}
                              >
                                <Lock size={14} className="mr-2" /> Request Device Control
                              </Button>
                            )
                          ) : (
                            // Host View: Peer Permissions List
                            <div className="space-y-2.5 border-t border-gray-850 pt-2.5">
                              <span className="text-xs text-gray-500 font-medium">Connected Peers ({collabStore.connectedPeers.length})</span>
                              {collabStore.connectedPeers.length === 0 ? (
                                <p className="text-[11px] text-gray-500 italic">No participants joined yet.</p>
                              ) : (
                                <div className="space-y-2">
                                  {collabStore.connectedPeers.map((peer) => (
                                    <div key={peer.userId} className="flex justify-between items-center text-xs p-2 bg-[#242424] rounded border border-gray-850">
                                      <span className="font-mono text-gray-300 truncate max-w-[120px]" title={peer.username}>
                                        {peer.username}
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        {peer.controlStatus === "granted" ? (
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            className="h-6 text-[10px] px-2 py-0"
                                            onClick={() => permissionManager.revokeControl(peer.userId, peer.username)}
                                          >
                                            Revoke
                                          </Button>
                                        ) : (
                                          <Button
                                            size="sm"
                                            className="h-6 text-[10px] px-2 py-0 bg-teal-600 hover:bg-teal-700"
                                            onClick={() => permissionManager.grantControl(peer.userId, peer.username)}
                                          >
                                            {peer.controlStatus === "requested" ? "Grant (Req)" : "Grant"}
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* 4. Live Telemetry Dashboard */}
                    <div className="space-y-3">
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        Real-Time Telemetry
                      </div>
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="p-3 bg-[#1a1a1a] rounded-md border border-gray-800 flex items-center space-x-3">
                          <Thermometer size={20} className="text-red-400" />
                          <div>
                            <p className="text-[10px] text-gray-500">Temp</p>
                            <p className="font-bold text-sm text-white">
                              {collabStore.liveTelemetry.temperature !== undefined ? `${collabStore.liveTelemetry.temperature} °C` : "--"}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-[#1a1a1a] rounded-md border border-gray-800 flex items-center space-x-3">
                          <Droplets size={20} className="text-blue-400" />
                          <div>
                            <p className="text-[10px] text-gray-500">Humidity</p>
                            <p className="font-bold text-sm text-white">
                              {collabStore.liveTelemetry.humidity !== undefined ? `${collabStore.liveTelemetry.humidity} %` : "--"}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-[#1a1a1a] rounded-md border border-gray-800 flex items-center space-x-3">
                          <Wind size={20} className="text-teal-400" />
                          <div>
                            <p className="text-[10px] text-gray-500">PM2.5</p>
                            <p className="font-bold text-sm text-white">
                              {collabStore.liveTelemetry.pm25 !== undefined ? `${collabStore.liveTelemetry.pm25} µg/m³` : "--"}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-[#1a1a1a] rounded-md border border-gray-800 flex items-center space-x-3">
                          <Battery size={20} className="text-green-400" />
                          <div>
                            <p className="text-[10px] text-gray-500">Voltage</p>
                            <p className="font-bold text-sm text-white">
                              {collabStore.liveTelemetry.voltage !== undefined ? `${collabStore.liveTelemetry.voltage} V` : "--"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5. Command Panel */}
                    <div className="space-y-3">
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        Command Execution
                      </div>

                      {permissionManager.canExecuteCommand(collabStore.userId) ? (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Select Control Command</Label>
                            <Select
                              value={selectedCloudCmdId}
                              onValueChange={(val) => {
                                setSelectedCloudCmdId(val)
                                setCloudCmdParams({})
                                setCloudCmdConfirmed(false)
                              }}
                            >
                              <SelectTrigger className="bg-[#1a1a1a] border-gray-800 text-sm">
                                <SelectValue placeholder="-- Select command --" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1a1a1a] border-gray-800 text-gray-200">
                                {cloudCommands.length === 0 ? (
                                  <SelectItem value="none" disabled>
                                    No commands available
                                  </SelectItem>
                                ) : (
                                  cloudCommands.map((cmd) => (
                                    <SelectItem key={cmd.id} value={cmd.id}>
                                      {cmd.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            {selectedCloudCmd && selectedCloudCmd.description && (
                              <p className="text-[10px] text-gray-500 mt-1 pl-1">{selectedCloudCmd.description}</p>
                            )}
                          </div>

                          {/* Parameters */}
                          {selectedCloudCmd?.parameter_schema && Object.keys(selectedCloudCmd.parameter_schema).length > 0 && (
                            <div className="space-y-3 p-3 bg-[#1a1a1a] border border-gray-800 rounded-md">
                              {Object.entries(selectedCloudCmd.parameter_schema).map(([key, schema]) => (
                                <div key={key} className="space-y-1.5">
                                  <Label className="text-xs text-gray-400 capitalize">
                                    {key} {schema.required && <span className="text-red-500">*</span>}
                                  </Label>
                                  {schema.type === "boolean" ? (
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`param-${key}`}
                                        checked={cloudCmdParams[key] || false}
                                        onCheckedChange={(checked) => setCloudCmdParams((p) => ({ ...p, [key]: checked }))}
                                        className="border-gray-600 data-[state=checked]:bg-teal-600"
                                      />
                                      <label htmlFor={`param-${key}`} className="text-sm">
                                        {schema.description || "Enable"}
                                      </label>
                                    </div>
                                  ) : (
                                    <Input
                                      type={schema.type === "number" || schema.type === "integer" ? "number" : "text"}
                                      placeholder={schema.description}
                                      className="bg-[#242424] border-gray-700 h-8 text-sm"
                                      value={cloudCmdParams[key] || ""}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        setCloudCmdParams((p) => ({
                                          ...p,
                                          [key]: schema.type === "number" || schema.type === "integer" ? (val ? Number(val) : "") : val,
                                        }))
                                      }}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Confirmation Alert */}
                          {selectedCloudCmd && (selectedCloudCmd.dangerous || selectedCloudCmd.requires_confirmation) && (
                            <Alert variant="destructive" className="bg-red-950/20 border-red-900/50">
                              <ShieldAlertIcon className="h-4 w-4 text-red-400" />
                              <AlertTitle className="text-sm">Caution Required</AlertTitle>
                              <AlertDescription className="text-xs text-gray-400 mt-2">
                                This command modifies remote device state.
                                <div className="flex items-center space-x-2 mt-3 bg-red-950/30 p-2 rounded border border-red-900/50">
                                  <Checkbox
                                    id="confirm-cmd-collab"
                                    checked={cloudCmdConfirmed}
                                    onCheckedChange={(c) => setCloudCmdConfirmed(c as boolean)}
                                    className="border-red-700 data-[state=checked]:bg-red-600"
                                  />
                                  <label htmlFor="confirm-cmd-collab" className="text-xs text-red-200 cursor-pointer select-none">
                                    I confirm I want to execute this command
                                  </label>
                                </div>
                              </AlertDescription>
                            </Alert>
                          )}

                          <Button
                            className="w-full bg-teal-600 hover:bg-teal-500 text-white disabled:bg-gray-800 disabled:text-gray-500"
                            disabled={
                              !selectedCloudCmdId ||
                              ((selectedCloudCmd?.dangerous || selectedCloudCmd?.requires_confirmation) && !cloudCmdConfirmed)
                            }
                            onClick={handleExecuteCollaborationCommand}
                          >
                            <Play className="w-4 h-4 mr-2" fill="currentColor" />
                            Execute Command
                          </Button>
                        </div>
                      ) : (
                        <div className="p-4 border border-dashed border-gray-800 rounded bg-[#1f1f1f] text-center">
                          <Lock size={20} className="mx-auto text-gray-500 mb-2" />
                          <p className="text-xs text-gray-400">
                            Command execution is locked. Request device control from the Host to interact.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 6. Recent Commands executed */}
                    <div className="space-y-3">
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        Session Command Log
                      </div>
                      <Card className="bg-[#1a1a1a] border-gray-800 text-gray-300 shadow-none">
                        <CardContent className="p-3 max-h-[220px] overflow-y-auto space-y-2">
                          {collabStore.recentCommands.length === 0 ? (
                            <p className="text-[11px] text-gray-500 italic text-center py-2">No commands executed yet.</p>
                          ) : (
                            collabStore.recentCommands.map((log) => (
                              <div key={log.id} className="flex justify-between items-center text-xs p-2 bg-[#202020] rounded border border-gray-850">
                                <div className="space-y-0.5">
                                  <p className="font-mono text-teal-400 font-semibold truncate max-w-[160px]">{log.command}</p>
                                  <p className="text-[10px] text-gray-500">
                                    By: {log.sender} &bull; {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                  </p>
                                </div>
                                <Badge variant="outline" className={
                                  log.status === "success" ? "bg-green-950/40 text-green-400 border-green-800/80 text-[9px]" :
                                  log.status === "failed" ? "bg-red-950/40 text-red-400 border-red-800/80 text-[9px]" :
                                  "bg-yellow-950/40 text-yellow-400 border-yellow-800/80 text-[9px] animate-pulse"
                                }>
                                  {log.status.toUpperCase()}
                                </Badge>
                              </div>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* LOCAL USB CONNECTION MODE UI */}
        {/* ======================================================== */}
        {activeMode === "local" && (
          <>
            {/* Left Pane: Local Logs Terminal & Input Bar */}
            <div className="flex flex-col flex-grow min-w-0 h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-gray-800">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-800 select-none">
                <div className="flex items-center space-x-2 text-gray-300">
                  <TerminalIcon size={16} className="text-blue-400" />
                  <span className="text-sm font-medium">Local Serial Output</span>
                  {localStore.status === "connected" && (
                    <Badge variant="outline" className="bg-green-950 text-green-400 border-green-800 ml-2 animate-pulse h-5 text-[10px]">
                      LIVE
                    </Badge>
                  )}
                </div>
                <button
                  onClick={handleClearTerm}
                  className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-[#3d3d3d] rounded"
                  title="Clear Local Terminal"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Terminal output box */}
              <div ref={localTermRef} className="flex-grow p-2 overflow-hidden bg-[#1e1e1e] w-full" />

              {/* Quick Action Commands */}
              <div className="px-4 py-2 border-t border-gray-800/80 bg-[#161616]">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">
                  <span>Quick Actions</span>
                  {localHistory.length > 0 && (
                    <button
                      onClick={() => saveLocalHistory([])}
                      className="text-[9px] hover:text-red-400 transition-colors uppercase font-normal"
                    >
                      Clear History
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_COMMANDS.map((qCmd) => (
                    <button
                      key={qCmd.value}
                      onClick={() => handleLocalSend(qCmd.value)}
                      disabled={localStore.status !== "connected"}
                      title={qCmd.description}
                      className="px-2.5 py-1 text-xs bg-[#242424] hover:bg-[#2d2d2d] border border-gray-800 hover:border-gray-700 text-gray-300 rounded font-medium disabled:opacity-40 disabled:hover:bg-[#242424] transition-colors font-mono"
                    >
                      <span className="text-teal-400">{qCmd.value}</span>
                    </button>
                  ))}
                  {localHistory.slice(-4).map((histCmd, i) => (
                    <button
                      key={i}
                      onClick={() => handleLocalSend(histCmd)}
                      disabled={localStore.status !== "connected"}
                      className="px-2.5 py-1 text-xs bg-[#1f2824] hover:bg-[#25322c] border border-teal-950/80 hover:border-teal-900/80 text-teal-300 rounded font-mono transition-colors"
                    >
                      {histCmd}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Bar */}
              <div className="p-4 border-t border-gray-800 bg-[#202020]">
                <form onSubmit={handleLocalFormSubmit} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        value={localCommand}
                        onChange={(e) => setLocalCommand(e.target.value)}
                        onKeyDown={handleLocalKeyDown}
                        disabled={localStore.status !== "connected"}
                        placeholder={localStore.status === "connected" ? "Enter local serial command..." : "Device disconnected"}
                        className="w-full bg-[#151515] border border-gray-800 focus:border-teal-500 text-white placeholder-gray-600 rounded px-3 py-2 text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                      />
                      {localStore.status === "connected" && (
                        <div className="absolute right-2.5 top-2.5 text-[10px] text-gray-600 pointer-events-none flex items-center space-x-0.5">
                          <CornerDownLeft size={10} />
                          <span>Enter</span>
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={localStore.status !== "connected" || !localCommand.trim()}
                      className="bg-teal-600 hover:bg-teal-500 text-white p-2 rounded shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Send command over Serial"
                    >
                      <Send size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span>Line Ending:</span>
                      <select
                        value={localLineEnding}
                        onChange={(e) => setLocalLineEnding(e.target.value)}
                        disabled={localStore.status !== "connected"}
                        className="bg-[#151515] border border-gray-800 rounded px-2 py-1 text-gray-400 focus:outline-none focus:border-teal-500 disabled:opacity-50"
                      >
                        <option value="\r\n">Both NL & CR (\r\n)</option>
                        <option value="\n">Newline (\n)</option>
                        <option value="\r">Carriage Return (\r)</option>
                        <option value="none">No Line Ending</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span>Baud Rate:</span>
                      <select
                        value={localStore.baudRate}
                        onChange={(e) => localStore.setBaudRate(Number(e.target.value))}
                        disabled={localStore.status !== "disconnected"}
                        className="bg-[#151515] border border-gray-800 rounded px-2 py-1 text-gray-400 focus:outline-none focus:border-teal-500 disabled:opacity-50"
                      >
                        <option value="9600">9600</option>
                        <option value="115200">115200</option>
                        <option value="921600">921600</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Pane: Local Connection & Local Firmware Flashing */}
            <div className="flex flex-col w-full lg:w-[380px] bg-[#151515] h-1/2 lg:h-full overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 bg-[#202020] border-b border-gray-800 sticky top-0 z-10 select-none">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Usb size={16} className="text-teal-400" />
                  <span className="text-sm font-medium">Local USB Console</span>
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Connection Status Card */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Local Connection
                    </span>
                    {localStore.isLocalAgentRunning ? (
                      <span className="inline-flex items-center text-[10px] text-green-400 font-semibold bg-green-950/50 border border-green-800 px-1.5 py-0.5 rounded">
                        Agent Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] text-red-400 font-semibold bg-red-950/50 border border-red-800 px-1.5 py-0.5 rounded">
                        Agent Offline
                      </span>
                    )}
                  </div>

                  <Card className="bg-[#1a1a1a] border-gray-800 text-gray-300 shadow-none">
                    <CardContent className="p-4 space-y-4">
                      {localStore.status === "connected" && localStore.deviceInfo ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-2.5 bg-[#242424] rounded-md border border-gray-850">
                              <p className="text-[10px] text-gray-500 mb-0.5">Chip Type</p>
                              <p className="font-semibold text-xs text-white">{localStore.deviceInfo.chipType}</p>
                            </div>
                            <div className="p-2.5 bg-[#242424] rounded-md border border-gray-850">
                              <p className="text-[10px] text-gray-500 mb-0.5">COM Port</p>
                              <p className="font-semibold text-xs text-white truncate">{localStore.deviceInfo.portName || "Unknown"}</p>
                            </div>
                          </div>

                          <Button
                            onClick={handleLocalDisconnect}
                            size="sm"
                            className="w-full flex justify-center items-center py-2 border border-red-800 text-red-400 bg-transparent hover:bg-red-950/40"
                          >
                            <Unplug size={14} className="mr-2" />
                            Disconnect Local Device
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-xs text-gray-500">
                            Connect via browser Web Serial or start the Local Agent for serial interaction.
                          </p>

                          <div className="space-y-3">
                            <Button
                              onClick={connectESP}
                              disabled={localStore.status === "connecting"}
                              variant="outline"
                              size="sm"
                              className="w-full border-gray-700 text-gray-300 hover:bg-[#2d2d2d] flex items-center justify-center"
                            >
                              <Usb size={14} className="mr-2 text-blue-400" />
                              Connect (Browser Serial)
                            </Button>

                            {localStore.isLocalAgentRunning ? (
                              <div className="space-y-2">
                                {localStore.availablePorts.length > 0 ? (
                                  <select
                                    value={localComPort}
                                    onChange={(e) => setLocalComPort(e.target.value)}
                                    className="block w-full border border-gray-800 rounded bg-[#242424] text-gray-200 text-xs px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    {localStore.availablePorts.map((p) => (
                                      <option key={p.path} value={p.path}>
                                        {p.path} {p.manufacturer ? `(${p.manufacturer})` : ""}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <div className="block w-full border border-gray-800 rounded bg-[#242424] text-gray-500 text-xs py-2 text-center">
                                    No USB devices detected
                                  </div>
                                )}
                                <Button
                                  onClick={() => connectArduino(localComPort)}
                                  disabled={localStore.status === "connecting" || !localComPort || localStore.availablePorts.length === 0}
                                  size="sm"
                                  className="w-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center"
                                >
                                  <Wifi size={14} className="mr-2" />
                                  Connect (Agent Serial)
                                </Button>
                              </div>
                            ) : (
                              <div className="p-3 border border-dashed border-gray-800 rounded bg-[#1f1f1f] text-center">
                                <p className="text-[10px] text-gray-500 mb-2">
                                  Download the Local Agent to detect Arduino COM ports.
                                </p>
                                <div className="flex justify-center space-x-2">
                                  <a
                                    href="#"
                                    className="inline-flex items-center px-2 py-1 border border-gray-800 text-[10px] rounded text-gray-400 bg-[#242424] hover:bg-[#2d2d2d]"
                                  >
                                    <Download size={10} className="mr-1" /> Mac
                                  </a>
                                  <a
                                    href="#"
                                    className="inline-flex items-center px-2 py-1 border border-gray-800 text-[10px] rounded text-gray-400 bg-[#242424] hover:bg-[#2d2d2d]"
                                  >
                                    <Download size={10} className="mr-1" /> Windows
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>

                          {localStore.status === "error" && (
                            <Alert variant="destructive" className="bg-red-950/20 border-red-950 py-2.5">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              <AlertDescription className="text-xs text-red-200">
                                Connection failed. Ensure the agent is running or permissions are granted.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Local DB Session Card */}
                {localStore.status === "connected" && (
                  <div className="space-y-3">
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      Database Session
                    </div>
                    <Card className="bg-[#1a1a1a] border-gray-800 text-gray-300 shadow-none">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Session Status:</span>
                          {localSessionId ? (
                            <Badge className="bg-green-600">ACTIVE</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-800 text-gray-400">INACTIVE</Badge>
                          )}
                        </div>

                        {!localSessionId ? (
                          <Button
                            size="sm"
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={startLocalSession}
                          >
                            <Play size={14} className="mr-2" />
                            Start DB Session
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                            onClick={endLocalSession}
                          >
                            <Square size={14} className="mr-2" />
                            End DB Session
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Local Flashing Panel */}
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    Local Firmware Flashing
                  </div>

                  <Card className="bg-[#1a1a1a] border-gray-800 text-gray-300 shadow-none">
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-400">Select Firmware Version</Label>
                        <Select
                          value={selectedFirmware}
                          onValueChange={(val) => {
                            setSelectedFirmware(val)
                            setLocalFwError(null)
                          }}
                          disabled={localFwFlashing || localStore.status !== "connected"}
                        >
                          <SelectTrigger className="bg-[#242424] border-gray-800 text-xs">
                            <SelectValue placeholder="-- Choose version --" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a1a] border-gray-800 text-gray-200">
                            {firmwareVersions.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No firmwares available
                              </SelectItem>
                            ) : (
                              firmwareVersions.map((fw) => (
                                <SelectItem key={fw.id} value={fw.id}>
                                  {fw.firmware_version} ({fw.firmware_type || "beta"})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={handleLocalFlash}
                        disabled={localFwFlashing || localStore.status !== "connected" || !isLocalFwCompatible}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs py-2 disabled:bg-gray-800 disabled:text-gray-500 flex items-center justify-center"
                      >
                        <UploadCloud className="w-4 h-4 mr-2" />
                        {localFwFlashing ? "Flashing..." : !isLocalFwCompatible && selectedFirmware ? "Incompatible Firmware" : "Flash to Local Device"}
                      </Button>

                      {/* Local Flashing progress display */}
                      {localStore.flashProgress && (
                        <div className="mt-2 p-3 bg-[#242424] border border-gray-800 rounded-md">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold capitalize text-teal-400">{localStore.flashProgress.phase}</span>
                            <span>{Math.round(localStore.flashProgress.percentage)}%</span>
                          </div>
                          <Progress value={localStore.flashProgress.percentage} className="h-1 bg-teal-950" />
                          {localStore.flashProgress.message && (
                            <p className="text-[10px] text-gray-500 mt-1">{localStore.flashProgress.message}</p>
                          )}
                        </div>
                      )}

                      {/* Error or Completed feedback */}
                      {localFwError && !localStore.flashProgress && (
                        <Alert variant="destructive" className="bg-red-950/20 border-red-900/50 py-2">
                          <AlertCircle className="w-4 h-4" />
                          <AlertDescription className="text-xs text-red-300">{localFwError}</AlertDescription>
                        </Alert>
                      )}

                      {localStore.flashProgress?.phase === "completed" && !localFwError && (
                        <Alert className="bg-green-950/20 border-green-900/50 py-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <AlertDescription className="text-xs text-green-200">
                            Flashing completed successfully!
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Flash Modal (Local Mode) */}
      {showConfirmFlashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          <div className="fixed inset-0 bg-black opacity-55"></div>
          <div className="relative w-auto max-w-md mx-auto my-6 z-50 p-4">
            <div className="relative flex flex-col w-full bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-lg outline-none focus:outline-none text-gray-200">
              <div className="flex items-start justify-between p-5 border-b border-gray-800 rounded-t">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <AlertCircle className="text-yellow-500 mr-2 w-5 h-5" />
                  Confirm Flashing
                </h3>
              </div>
              <div className="relative p-6 flex-auto text-sm leading-relaxed text-gray-400">
                <p className="mb-4">
                  You are about to flash firmware version <strong className="text-white">{selectedLocalFw?.firmware_version}</strong> to the locally connected device.
                  This will completely overwrite the existing firmware.
                </p>
                <p>Do not unplug the device during this process. Are you sure you want to proceed?</p>
              </div>
              <div className="flex items-center justify-end p-5 border-t border-gray-800 rounded-b space-x-2">
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowConfirmFlashModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-500 text-white"
                  onClick={executeLocalFlash}
                >
                  Confirm Flash
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
