import { NextApiRequest, NextApiResponse } from 'next';
import { ThenArg } from '../../../types/typeUtils';

async function getResponse() {
  return [
    { id: 101, name: 'Alice' },
    { id: 102, name: 'Bob' },
    { id: 103, name: 'Caroline' },
    { id: 104, name: 'Dave' },
  ];
}

export type GetUsersResponse = ThenArg<ReturnType<typeof getResponse>>;

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    res.status(200).json(await getResponse());
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
};
