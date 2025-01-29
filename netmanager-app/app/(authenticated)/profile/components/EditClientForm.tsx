import React, { useState, useEffect, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import DialogWrapper from "./DialogWrapper"
import { Toast } from "@/components/ui/toast"
import { addClients, addClientsDetails, performRefresh } from "@/core/redux/slices/clientsSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus } from "lucide-react"
import { users } from "@/core/apis/users"
import type { RootState } from "@/core/redux/store"
import { Client } from "@/app/types/clients"
import { getUserClientsApi, updateClientApi } from "@/core/apis/settings"

interface EditClientFormProps {
  open: boolean
  onClose: () => void;
  data: Client
}

const EditClientForm: React.FC<EditClientFormProps> = ({ open, onClose, data }) => {
  const dispatch = useDispatch()
  const userInfo = useSelector((state: RootState) => state.user.userDetails)
  const clientID = data?._id
  const [loading, setLoading] = useState(false)
  const [isError, setIsError] = useState({ isError: false, message: "", type: "" })
  const [clientName, setClientName] = useState("")
  const [ipAddresses, setIpAddresses] = useState([""])

  const handleInitialData = useCallback(() => {
    setClientName(data?.name || "");
    const ipAddresses = Array.isArray(data?.ip_addresses)
      ? data?.ip_addresses
      : data?.ip_addresses
        ? [data?.ip_addresses]
        : [""];
    setIpAddresses(ipAddresses);
  }, [data]);
  
  useEffect(() => {
    handleInitialData();
  }, [handleInitialData]);

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

      const response = await updateClientApi(data, clientID)
      if (!response) {
        throw new Error("Failed to update client")
      }
      const res = await users.getUserDetails(userInfo?._id || "")
      const resp = await getUserClientsApi(userInfo?._id || "")
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
      onClose={onClose}
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

