import { getAllUsers } from '../pages/api/db';
import { FunctionThenArg } from './typeUtils';

export type User = FunctionThenArg<typeof getAllUsers>[number];
