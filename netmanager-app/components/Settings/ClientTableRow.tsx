import type { FC } from "react"
import moment from "moment"
import {Button} from "@/components/ui/button"
import CopyIcon from "@/icons/Common/copy.svg"
import EditIcon from "@/icons/Common/edit-pencil.svg"

interface ClientTableRowProps {
  client: any
  onGenerateToken: (client: any) => void
  onEditClient: (client: any) => void
  onCopyToken: (token: string) => void
  getClientToken: (clientId: string) => string | null
  getClientTokenExpiryDate: (clientId: string) => string | null
  isLoadingToken: boolean
}

export const ClientTableRow: FC<ClientTableRowProps> = ({
  client,
  onGenerateToken,
  onEditClient,
  onCopyToken,
  getClientToken,
  getClientTokenExpiryDate,
  isLoadingToken,
}) => {
  const displayIPAddresses = (client) => {
    return Array.isArray(client.ip_addresses) ? client.ip_addresses.join(", ") : client.ip_addresses
  }

  return (
    <tr className="border-b border-b-secondary-neutral-light-100">
      <td className="w-[200px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-800 uppercase">
        {client?.name}
      </td>
      <td className="w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400">
        {displayIPAddresses(client)}
      </td>
      <td className="w-[142px] px-4 py-3">
        <div
          className={`px-2 py-[2px] rounded-2xl w-auto inline-flex justify-center text-sm leading-5 items-center mx-auto ${
            client?.isActive
              ? "bg-success-50 text-success-700"
              : "bg-secondary-neutral-light-50 text-secondary-neutral-light-500"
          }`}
        >
          {client?.isActive ? "Activated" : "Not Activated"}
        </div>
      </td>
      <td className="w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400">
        {moment(client?.createdAt).format("MMM DD, YYYY")}
      </td>
      <td className="w-[138px] px-4 py-3">
        {getClientToken(client._id) ? (
          <span className="font-medium text-sm leading-5 text-secondary-neutral-light-400 flex items-center gap-2">
            {getClientToken(client._id).slice(0, 2)}....
            {getClientToken(client._id).slice(-2)}
            <div
              className="w-6 h-6 bg-white rounded border border-gray-200 flex justify-center items-center gap-2 cursor-pointer"
              onClick={() => onCopyToken(getClientToken(client._id))}
            >
              <CopyIcon />
            </div>
          </span>
        ) : (
          <Button
            title={!client?.isActive ? "Tap to generate token" : "Token already generated"}
            className={`px-4 py-2 rounded-2xl w-auto inline-flex justify-center text-sm leading-5 items-center mx-auto ${
              !getClientToken(client._id)
                ? "bg-success-700 text-success-50 cursor-pointer"
                : "bg-secondary-neutral-light-50 text-secondary-neutral-light-500"
            }`}
            disabled={isLoadingToken}
            onClick={() => onGenerateToken(client)}
          >
            Generate
          </Button>
        )}
      </td>
      <td className="w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400">
        {getClientTokenExpiryDate(client._id) && moment(getClientTokenExpiryDate(client._id)).format("MMM DD, YYYY")}
      </td>
      <td className="w-24 px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400 capitalize">
        <div
          className="w-9 h-9 p-2.5 bg-white rounded border border-gray-200 justify-center items-center gap-2 cursor-pointer"
          onClick={() => onEditClient(client)}
        >
          <EditIcon className="w-4 h-4" />
        </div>
      </td>
    </tr>
  )
}

