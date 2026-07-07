import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';
import { clientService } from '../services/clientService';
import type {
  CreateClientRequest,
  UpdateClientRequest,
  ActivateClientRequest,
  GenerateTokenRequest,
} from '../types/api';

// Get clients
export const useClients = () => {
  return useSWR('clients', () => clientService.getClients());
};

// Get clients by user ID
export const useClientsByUserId = (userId: string) => {
  return useSWR(
    userId ? `clients-${userId}` : null,
    () => clientService.getClientsByUserId(userId),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );
};

// Create client
export const useCreateClient = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'clients',
    async (key, { arg }: { arg: CreateClientRequest }) => {
      return await clientService.createClient(arg);
    },
    {
      onSuccess: () => {
        mutate(key => typeof key === 'string' && key.startsWith('clients'));
      },
    }
  );
};

// Update client
export const useUpdateClient = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'clients',
    async (
      key,
      { arg }: { arg: { clientId: string; clientData: UpdateClientRequest } }
    ) => {
      return await clientService.updateClient(arg.clientId, arg.clientData);
    },
    {
      onSuccess: () => {
        mutate(key => typeof key === 'string' && key.startsWith('clients'));
      },
    }
  );
};

// Activate client
export const useActivateClient = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'clients',
    async (
      key,
      {
        arg,
      }: { arg: { clientId: string; activationData: ActivateClientRequest } }
    ) => {
      return await clientService.activateClient(
        arg.clientId,
        arg.activationData
      );
    },
    {
      onSuccess: () => {
        mutate(key => typeof key === 'string' && key.startsWith('clients'));
      },
    }
  );
};

// Request client activation
export const useRequestClientActivation = () => {
  return useSWRMutation(
    'client-activation-request',
    async (key, { arg }: { arg: string }) => {
      return await clientService.requestClientActivation(arg);
    }
  );
};

// Generate token
export const useGenerateToken = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'clients',
    async (key, { arg }: { arg: GenerateTokenRequest }) => {
      return await clientService.generateToken(arg);
    },
    {
      onSuccess: () => {
        mutate(key => typeof key === 'string' && key.startsWith('clients'));
      },
    }
  );
};
