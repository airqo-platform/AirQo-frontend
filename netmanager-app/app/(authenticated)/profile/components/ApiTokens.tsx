import type React from "react"
import { useEffect, useState } from "react"
import moment from "moment"
import { useAppDispatch, useAppSelector } from "@/core/redux/hooks"
import { Toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import {  performRefresh } from "@/lib/store/services/apiClient"
import EditClientForm from "./EditClientForm"
import DialogWrapper from "./DialogWrapper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, Copy, Info } from "lucide-react"
import { api } from "../utils/api"tore"

const UserClientsTable: React.FC = () => {
  const dispatch = useAppDispatch()
  const [isError, setIsError] = useState({ isError: false, message: "", type: "" })
  const [isActivationRequestError, setIsActivationRequestError] = useState({ isError: false, message: "", type: "" })
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingToken, setIsLoadingToken] = useState(false)
  const [isLoadingActivationRequest, setIsLoadingActivationRequest] = useState(false)
  const [openEditForm, setOpenEditForm] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const userInfo = useAppSelector((state) => state.user.userDetails)
  const clients = useAppSelector((state) => state.sites.clients)
  const clientsDetails = useAppSelector((state) => state.sites.clientsDetails)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  const onPageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const setErrorState = (message: string, type: string) => {
    setIsError({
      isError: true,
      message,
      type,
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const res = await api.getUserDetailsAccount(userInfo?._id)
        if (res.success === true) {
          dispatch({ type: "ADD_CLIENTS", payload: res.users[0].clients })
          setCurrentPage(1)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [userInfo?._id, dispatch])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await api.getClients(userInfo?._id)
        if (response.success === true) {
          dispatch({ type: "ADD_CLIENTS_DETAILS", payload: response.clients })
        }
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [userInfo?._id, dispatch])

  const hasAccessToken = (clientId: string) => {
    const client =
      Array.isArray(clientsDetails) && (clientsDetails)
        ? clientsDetails?.find((client: any) => client._id === clientId)
        : undefined
    return client && client.access_token
  }

  const getClientToken = (clientID: string) => {
    const client =
      Array.isArray(clientsDetails) && (clientsDetails)
        ? clientsDetails?.find((client: any) => client._id === clientID)
        : undefined
    return client && client.access_token && client.access_token.token
  }

  const getClientTokenExpiryDate = (clientID: string) => {
    const client =
      Array.isArray(clientsDetails) && (clientsDetails)
        ? clientsDetails?.find((client: any) => client._id === clientID)
        : undefined
    return client && client.access_token && client.access_token.expires
  }

  const handleGenerateToken = async (res: any) => {
    setIsLoadingToken(true)
    if (!res?.isActive) {
      setShowInfoModal(true)
      setIsLoadingToken(false)
    } else {
      try {
        const response = await api.generateToken(res)
        if (response.success === true) {
          setErrorState("Token generated", "success")
        }
        dispatch(performRefresh())
      } catch (error: any) {
        setErrorState(error.message, "error")
      } finally {
        setIsLoadingToken(false)
      }
    }
  }

  const handleActivationRequest = async () => {
    const setActivationRequestErrorState = (message: string, type: string) => {
      setIsActivationRequestError({
        isError: true,
        message,
        type,
      })
    }
    setIsLoadingActivationRequest(true)
    try {
      const clientID = selectedClient?._id
      const response = await api.activationRequest(clientID)
      if (response.success === true) {
        setShowInfoModal(false)
        setTimeout(() => {
          setActivationRequestErrorState("Activation request sent successfully", "success")
        }, 3000)
      }
    } catch (error: any) {
      setShowInfoModal(false)
      setTimeout(() => {
        setActivationRequestErrorState(error.message, "error")
      }, 3000)
    } finally {
      setIsLoadingActivationRequest(false)
    }
  }

  const displayIPAddresses = (client: any) => {
    return Array.isArray(client.ip_addresses) ? client.ip_addresses.join(", ") : client.ip_addresses
  }

  return (
    <div className="overflow-x-auto">
      {isError.isError && <Toast type={isError.type} message={isError.message} />}
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
              .map((client: any, index: number) => (
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
                  <TableCell>{moment(client?.createdAt).format("MMM DD, YYYY")}</TableCell>
                  <TableCell>
                    {getClientToken(client._id) ? (
                      <div className="flex items-center">
                        <span className="mr-2">
                          {getClientToken(client._id).slice(0, 2)}....
                          {getClientToken(client._id).slice(-2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(getClientToken(client._id))
                            setErrorState("Token copied to clipboard!", "success")
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
                          const res = {
                            name: client.name,
                            client_id: client._id,
                            isActive: client.isActive ? client.isActive : false,
                          }
                          setSelectedClient(client)
                          handleGenerateToken(res)
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
      {isActivationRequestError.isError && (
        <Toast type={isActivationRequestError.type} message={isActivationRequestError.message} />
      )}
      <EditClientForm open={openEditForm} closeModal={() => setOpenEditForm(false)} data={selectedClient} />
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

