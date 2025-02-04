import type React from "react"
import { useEffect, useState } from "react"
import moment from "moment"
import { useAppDispatch, useAppSelector } from "@/core/redux/hooks"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { performRefresh } from "@/core/redux/slices/clientsSlice"
import EditClientForm from "./EditClientForm"
import CreateClientForm from "./CreateClientForm"
import DialogWrapper from "./DialogWrapper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, Copy, Info, Plus } from "lucide-react"
import { users } from "@/core/apis/users"
import { getUserClientsApi } from "@/core/apis/settings"
import type { Client } from "@/app/types/clients"
import { generateTokenApi, activationRequestApi } from "@/core/apis/settings"

const UserClientsTable: React.FC = () => {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingToken, setIsLoadingToken] = useState(false)
  const [isLoadingActivationRequest, setIsLoadingActivationRequest] = useState(false)
  const [openEditForm, setOpenEditForm] = useState(false)
  const [openCreateForm, setOpenCreateForm] = useState(false)
  const [selectedClient, setSelectedClient] = useState({} as Client)
  const userInfo = useAppSelector((state) => state.user.userDetails)
  const [clients, setClients] = useState<Client[]>([])
  const [clientsDetails, setClientsDetails] = useState<Client[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  const fetchClients = async () => {
    setIsLoading(true)
    try {
      const res = await users.getUserDetails(userInfo?._id || "")
      if (res) {
        dispatch({ type: "ADD_CLIENTS", payload: res.users[0].clients })
        setCurrentPage(1)
      }
      setClients(res.users[0].clients)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchClientDetails = async () => {
    setIsLoading(true)
    try {
      const response = await getUserClientsApi(userInfo?._id || "")
      if (response) {
        dispatch({ type: "ADD_CLIENTS_DETAILS", payload: response })
      }
      setClientsDetails(response)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to fetch client details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
    fetchClientDetails()
  }, [userInfo?._id, dispatch])

  const hasAccessToken = (clientId: string) => {
    const client =
      Array.isArray(clientsDetails) && clientsDetails
        ? clientsDetails?.find((client: Client) => client._id === clientId)
        : undefined
    return client && client.access_token
  }

  const getClientToken = (clientID: string) => {
    const client =
      Array.isArray(clientsDetails) && clientsDetails
        ? clientsDetails?.find((client: Client) => client._id === clientID)
        : undefined
    return client && client.access_token && client.access_token.token
  }

  const getClientTokenExpiryDate = (clientID: string) => {
    const client =
      Array.isArray(clientsDetails) && clientsDetails
        ? clientsDetails?.find((client: Client) => client._id === clientID)
        : undefined
    return client && client.access_token && client.access_token.expires
  }

  const handleGenerateToken = async (res: Client) => {
    setIsLoadingToken(true)
    if (!res?.isActive) {
      setShowInfoModal(true)
      setIsLoadingToken(false)
      return;
    } else {
      try {
        const response = await generateTokenApi(res)
        if (response) {
          toast({
            title: "Success",
            description: "Token generated successfully",
          })
        }
        dispatch(performRefresh())
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error.message || "Failed to generate token";
        toast({
          title: "Error",
          description: errorMessage,
        })
      } finally {
        setIsLoadingToken(false)
      }
    }
  }

  const handleActivationRequest = async () => {
    setIsLoadingActivationRequest(true)
    try {
      const clientID = selectedClient?._id
      const response = await activationRequestApi(clientID)
      if (response) {
        setShowInfoModal(false)
        setTimeout(() => {
          toast({
            title: "Success",
            description: "Activation request sent successfully",
          })
        }, 3000)
      }
    } catch (error: any) {
      setShowInfoModal(false)
      setTimeout(() => {
        toast({
          title: "Error",
          description: error.message || "Failed to send activation request",
          variant: "destructive",
        })
      }, 3000)
    } finally {
      setIsLoadingActivationRequest(false)
    }
  }

  const displayIPAddresses = (client: Client) => {
    return Array.isArray(client.ip_addresses) ? client.ip_addresses.join(", ") : client.ip_addresses
  }

  const handleClientCreated = () => {
    fetchClients()
    fetchClientDetails()
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Clients</h2>
        <Button onClick={() => setOpenCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Client
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Client name</TableHead>
            <TableHead className="w-[138px]">IP Address</TableHead>
            <TableHead className="w-[142px]">Client Status</TableHead>
            <TableHead className="w-[138px]">Created</TableHead>
            <TableHead className="w-[138px]">Token</TableHead>
            <TableHead className="w-[138px]">Expires</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Skeleton className="w-full h-12" />
              </TableCell>
            </TableRow>
          ) : clients?.length > 0 ? (
            clients
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((client: Client, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{client?.name}</TableCell>
                  <TableCell>{displayIPAddresses(client)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        client?.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {client?.isActive ? "Activated" : "Not Activated"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {client?.access_token?.createdAt
                      ? moment(client.access_token.createdAt).format("MMM DD, YYYY")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {getClientToken(client._id) ? (
                      <div className="flex items-center">
                        <span className="mr-2 font-mono">
                          {getClientToken(client._id).slice(0, 4)}
                          <span className="mx-1">•••••••</span>
                          {getClientToken(client._id).slice(-4)}
                        </span>
                        <Button
                          title="Copy full token"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(getClientToken(client._id))
                            toast({
                              title: "Success",
                              description: "API token copied to clipboard",
                              variant: "success",
                            })
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant={!hasAccessToken(client._id) ? "default" : "secondary"}
                        size="sm"
                        disabled={isLoadingToken}
                        onClick={() => {
                          setSelectedClient(client)
                          handleGenerateToken(client)
                        }}
                      >
                        Generate
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    {getClientTokenExpiryDate(client._id) &&
                      moment(getClientTokenExpiryDate(client._id)).format("MMM DD, YYYY")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setOpenEditForm(true)
                        setSelectedClient(client)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Add your Pagination component here */}
      <EditClientForm
        open={openEditForm}
        onClose={() => setOpenEditForm(false)}
        data={selectedClient}
        onClientUpdated={handleClientCreated}
      />
      <CreateClientForm
        open={openCreateForm}
        onClose={() => setOpenCreateForm(false)}
        onClientCreated={handleClientCreated}
      />
      <DialogWrapper
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        handleClick={handleActivationRequest}
        primaryButtonText={"Send activation request"}
        loading={isLoadingActivationRequest}
      >
        <div className="flex items-center">
          <Info className="h-5 w-5 mr-2 text-blue-500" />
          <p className="text-sm text-gray-600">
            You cannot generate a token for an inactive client. Reach out to support for assistance at support@airqo.net
            or send an activation request.
          </p>
        </div>
      </DialogWrapper>
    </div>
  )
}

export default UserClientsTable

