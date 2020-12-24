import { IncomingMessage, ServerResponse } from 'http';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import { FunctionThenArg } from '../../types/typeUtils';

export type TRequest = IncomingMessage & {
  cookies?: { [key: string]: any };
};
export type TResponse = ServerResponse;

type Context = {
  req: TRequest;
};

type TResolverResponse<TResponseData> = {
  data: TResponseData;
  statusCode?: number;
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
  ctx: Context,
) => PromiseLike<TResolverResponse<TResponseData>>;

function endpointHandler<TResponseData>(
  resolve: TResponseResolver<TResponseData>,
) {
  const handler: NextApiHandler<TResponseShape<TResponseData>> = async (
    req,
    res,
  ) => {
    try {
      const ctx = {
        req,
        res,
      };
      const { data, statusCode = 200 } = await resolve(ctx);

      res.status(statusCode).json({ data });
    } catch (_err) {
      const err = getError(_err, 500);
      res.status(err.statusCode).json(err);
    }
  };

  return handler;
}

async function ssrHandler<TResponseData>(
  resolve: TResponseResolver<TResponseData>,
  ctx: Context,
) {
  const { data } = await resolve(ctx);

  return {
    props: {
      data,
    },
  };
}

type InferGetDataFunction<T extends Function> = TResponseResolver<
  FunctionThenArg<T>
>;

export function makeSSRFunctions<TResponseData>(
  resolve: TResponseResolver<TResponseData>,
) {
  return {
    async getServerSideProps(ctx: GetServerSidePropsContext) {
      return ssrHandler(resolve, {
        req: ctx.req,
      });
    },
    resolve,
  };
}

// above is "framework"
// below is the actual function
async function playgroundDataFetcher() {
  return {
    foo: 'bar',
  };
}
export const playgroundResolver: InferGetDataFunction<
  typeof playgroundDataFetcher
> = async () => {
  const data = await playgroundDataFetcher();
  return {
    data,
  };
};

export default endpointHandler(playgroundResolver);
