import type getUsersApiResolver from './users';
import { FunctionThenArg } from '../../../types/typeUtils';

export type GetUsersApiEnvelope = FunctionThenArg<typeof getUsersApiResolver>;
export const GetUsersAPIPath = '/api/v2/users';
