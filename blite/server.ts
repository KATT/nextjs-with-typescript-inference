import { ServerResponse } from 'http';
import {
  GetServerSidePropsContext,
  NextApiHandler,
  NextApiRequest,
} from 'next';
import { serialize } from 'superjson';
import { SuperJSONResult } from 'superjson/dist/types';
import { FunctionThenArg } from '../types/typeUtils';

export type TRequest = NextApiRequest;
export type TResponse = ServerResponse;

type RequestContext = {
  req: TRequest;
};

type TResolverResponse<TResponseData> = {
  statusCode?: number;
  data: TResponseData;
};

type TErrorResponse = {
  statusCode: number;
  message: string;
  stack?: string;
};

type ErrorWithExtras = Error & {
  statusCode?: unknown;
};

function parseIntOrNull(input: unknown) {
  let num = NaN;
  if (typeof input === 'string') {
    num = Number(input);
  } else if (typeof input === 'number') {
    num = input;
  }
  if (isFinite(num)) {
    return num;
  }
  return null;
}

function getError(
  err: ErrorWithExtras,
  defaultStatusCode = 500,
): TErrorResponse {
  return {
    message: err.message,
    statusCode: parseIntOrNull(err.statusCode) ?? defaultStatusCode,
  };
}

type TResponseShape<TResponseData> =
  | TErrorResponse
  | {
      data: TResponseData;
    };

type TResponseResolver<TResponseData> = (
  ctx: RequestContext,
) => PromiseLike<TResolverResponse<TResponseData>>;

export function endpointHandler<TResponseData>(
  resolve: TResponseResolver<TResponseData>,
) {
  if (typeof window !== 'undefined') {
    throw new Error('You have imported an endpoint handler in the client');
  }
  const handler: NextApiHandler<TResponseShape<SuperJSONResult>> = async (
    req,
    res,
  ) => {
    try {
      const ctx = {
        req,
        res,
      };
      const { data, statusCode = 200 } = await resolve(ctx);

      res.status(statusCode).json({ data: serialize(data) });
    } catch (_err) {
      const err = getError(_err, 500);
      res.status(err.statusCode).json(err);
    }
  };

  return handler;
}

async function ssrHandler<TResponseData>(
  resolve: TResponseResolver<TResponseData>,
  ctx: RequestContext,
) {
  const { data } = await resolve(ctx);

  return {
    props: {
      data,
    },
  };
}

export type InferGetDataFunction<T extends Function> = TResponseResolver<
  FunctionThenArg<T>
>;

export function makeSSRFunctions<TResponseData>(
  resolve: TResponseResolver<TResponseData>,
) {
  assertOnServer();
  return {
    async getServerSideProps(ctx: GetServerSidePropsContext) {
      return ssrHandler(resolve, {
        req: ctx.req as any, // fixme,
      });
    },
    resolve,
  };
}

export function assertOnServer(desc?: string) {
  if (typeof window !== 'undefined') {
    throw new Error(
      'Imported server-only functionality on client' + desc ? ` (${desc})` : '',
    );
  }
}

assertOnServer('server.ts');
