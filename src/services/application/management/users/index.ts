import { useQuery } from "react-query";
import {
  httpRequestGetKeycloakUsers,
  GetKeycloakUsersParams,
  KeycloakUser,
} from "@/services/application/management/keycloak/users";

interface UseQueryGetUsersParams {
  params?: GetKeycloakUsersParams;
  config?: any;
}

export const useQueryGetUsers = ({ params, config }: UseQueryGetUsersParams = {}) => {
  return useQuery<KeycloakUser[]>({
    queryKey: ["keycloak-users", params],
    queryFn: () => httpRequestGetKeycloakUsers(params),
    ...config,
  });
};

