import React, { useState, useEffect, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import DialogWrapper from "@/components/Modal/DialogWrapper"
import Toast from "@/components/Toast"
import { addClients, addClientsDetails, performRefresh } from "@/lib/store/services/apiClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus } from "lucide-react"
import { api } from "../utils/api"
import type { RootState } from "@/lib/store"

interface EditClientFormProps {
  open: boolean
  closeModal: () => void
  data: any
}

const EditClientForm: React.FC<EditClientFormProps> = ({ open, closeModal, data }) => {
  const dispatch = useDispatch()
  const userInfo = useSelector((state: RootState) => state.user.userInfo)
  const clientID = data?._id
  const [loading, setLoading] = useState(false)
  const [isError, setIsError] = useState({ isError: false, message: "", type: "" })
  const [clientName, setClientName] = useState("")
  const [ipAddresses, setIpAddresses] = useState([""])

  useEffect(() => {
    handleInitialData()
  }, [handleInitialData]) // Updated dependency

  const handleInitialData = () => {
    setClientName(data?.name || "")
    const ipAddresses = Array.isArray(data?.ip_addresses)
      ? data?.ip_addresses
      : data?.ip_addresses
        ? [data?.ip_addresses]
        : [""]
    setIpAddresses(ipAddresses)
  }

  const handleInputValueChange = useCallback((type: string, value: string, index?: number) => {
    if (type === "clientName") {
      setClientName(value)
    } else if (type === "ipAddress" && index !== undefined) {
      setIpAddresses((prev) => {
        const newIpAddresses = [...prev]
        newIpAddresses[index] = value
        return newIpAddresses
      })
    }
  }, [])

  const handleRemoveInputValue = useCallback((type: string, index?: number) => {
    if (type === "clientName") {
      setClientName("")
    } else if (type === "ipAddress" && index !== undefined) {
      setIpAddresses((prev) => prev.filter((_, i) => i !== index))
    }
  }, [])

  const handleAddIpAddress = useCallback(() => {
    setIpAddresses((prev) => [...prev, ""])
  }, [])

  const handleSubmit = async () => {
    setLoading(true)

    if (!clientName) {
      setIsError({
        isError: true,
        message: "Client name can't be empty",
        type: "error",
      })
      setLoading(false)
      return
    }

    try {
      const data = {
        name: clientName,
        user_id: userInfo?._id,
        ip_addresses: ipAddresses.filter((ip) => ip.trim() !== ""),
      }

      const response = await api.updateClient(data, clientID)
      if (response.success !== true) {
        throw new Error("Failed to update client")
      }
      const res = await api.getUserDetailsAccount(userInfo?._id)
      const resp = await api.getClients(userInfo?._id)
      dispatch(addClients(res.users[0].clients))
      dispatch(addClientsDetails(resp.clients))
      dispatch(performRefresh())
      closeModal()
    } catch (error: any) {
      setIsError({
        isError: true,
        message: error?.response?.data?.message || "Failed to Edit client",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isError.isError) {
      const timer = setTimeout(() => {
        setIsError({
          isError: false,
          message: "",
          type: "",
        })
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isError.isError])

  return (
    <DialogWrapper
      open={open}
      onClose={closeModal}
      handleClick={handleSubmit}
      primaryButtonText="Update"
      loading={loading}
    >
      {isError.isError && <Toast type={isError.type} message={isError.message} />}
      <h3 className="text-lg font-medium text-secondary-neutral-light-800 leading-[26px] mb-2">Edit client</h3>

      <div className="flex flex-col gap-3 justify-start max-h-[350px] overflow-y-auto">
        <div className="relative">
          <Label htmlFor="clientName">Client Name</Label>
          <Input
            id="clientName"
            type="text"
            placeholder="Enter client name"
            value={clientName}
            onChange={(e) => handleInputValueChange("clientName", e.target.value)}
          />
          {clientName && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => handleRemoveInputValue("clientName")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {ipAddresses.map((ip, index) => (
          <div key={index} className="relative">
            <Label htmlFor={`ipAddress${index}`}>IP Address {index + 1}</Label>
            <Input
              id={`ipAddress${index}`}
              type="text"
              placeholder={`Enter IP address ${index + 1}`}
              value={ip}
              onChange={(e) => handleInputValueChange("ipAddress", e.target.value, index)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => handleRemoveInputValue("ipAddress", index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button variant="outline" onClick={handleAddIpAddress} className="flex items-center justify-start text-sm">
          <Plus className="mr-2 h-4 w-4" />
          Add another IP address
        </Button>
      </div>
    </DialogWrapper>
  )
}

export default React.memo(EditClientForm)

