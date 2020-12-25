import { IncomingMessage } from 'http';
import { NextApiResponse } from 'next';

export type TResponse = NextApiResponse;
export type TRequest = IncomingMessage & {
  cookies?: { [key: string]: any };
};
type Context = {
  req: TRequest;
};

type TResolverResponse<TResponseData> = {
  statusCode?: number;
  data: TResponseData;
};

type TResponseResolver<TResponseData> = (
  ctx: Context,
) => PromiseLike<TResolverResponse<TResponseData>>;

function endpointHandler<TResponseData>(
  resolve: TResponseResolver<TResponseData>,
) {
  return async (req: TRequest, res: TResponse) => {
    try {
      const ctx = {
        req,
        res,
      };
      const { data, statusCode = 200 } = await resolve(ctx);

      res.status(statusCode).json({ data });
    } catch (err) {
      res.status(err.statusCode ?? 500).json(err);
    }
  };
}
