import React, { useState } from 'react'
import {  useAppSelector } from "@/core/redux/hooks"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from 'lucide-react'
import { settings } from "@/core/apis/settings"
import { useToast } from "@/components/ui/use-toast"

interface CreateClientFormProps {
  open: boolean
  onClose: () => void
  onClientCreated: () => void
}

const CreateClientForm: React.FC<CreateClientFormProps> = ({ open, onClose, onClientCreated }) => {
  const { toast } = useToast()
  const userInfo = useAppSelector((state) => state.user.userDetails)
  const [clientName, setClientName] = useState('')
  const [ipAddresses, setIpAddresses] = useState([''])
  const [isLoading, setIsLoading] = useState(false)

  const handleInputValueChange = (type: string, value: string, index?: number) => {
    if (type === 'clientName') {
      setClientName(value)
    } else if (type === 'ipAddress' && index !== undefined) {
      const newIpAddresses = [...ipAddresses]
      newIpAddresses[index] = value
      setIpAddresses(newIpAddresses)
    }
  }

  const handleRemoveInputValue = (index: number) => {
    const newIpAddresses = ipAddresses.filter((_, i) => i !== index)
    setIpAddresses(newIpAddresses)
  }

  const handleAddIpAddress = () => {
    setIpAddresses([...ipAddresses, ''])
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      if (!clientName) {
        throw new Error("Client name can't be empty")
      }

      const data = {
        name: clientName,
        user_id: userInfo?._id,
        ip_addresses: ipAddresses.filter((ip) => ip.trim() !== ''),
      }

      const response = await settings.createClientApi(data)
      if (response) {
        toast({
          title: "Success",
          description: "Client created successfully",
        })
        onClientCreated()
        onClose()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create client",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Client</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => handleInputValueChange('clientName', e.target.value)}
              placeholder="Enter client name"
            />
          </div>
          {ipAddresses.map((ip, index) => (
            <div key={index} className="grid gap-2">
              <Label htmlFor={`ipAddress${index}`}>
                {index === 0 ? 'IP Address (Optional)' : `IP Address ${index + 1}`}
              </Label>
              <div className="flex gap-2">
                <Input
                  id={`ipAddress${index}`}
                  value={ip}
                  onChange={(e) => handleInputValueChange('ipAddress', e.target.value, index)}
                  placeholder={`Enter IP address ${index + 1}`}
                />
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveInputValue(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={handleAddIpAddress}
            className="flex items-center justify-start text-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add another IP address
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Client'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateClientForm
