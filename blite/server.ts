import { ServerResponse } from 'http';
import {
  GetServerSidePropsContext,
  NextApiHandler,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import { env } from 'process';
import { serialize } from 'superjson';
import { SuperJSONResult } from 'superjson/dist/types';
import { FunctionThenArg } from '../types/typeUtils';
import { TErrorData } from './shared';
assertOnServer('server.ts');

export type TRequest = NextApiRequest;
export type TResponse = ServerResponse;

export type RequestContext = {
  req: TRequest;
};

type TResolverResponse<TResponseData> = {
  statusCode?: number;
  data: TResponseData;
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

function getError(err: ErrorWithExtras, defaultStatusCode = 500): TErrorData {
  return {
    message: err.message,
    statusCode: parseIntOrNull(err.statusCode) ?? defaultStatusCode,
  };
}
export type TResponseShape =
  | {
      ok: true;
      data: SuperJSONResult;
    }
  | {
      ok: false;
      error: TErrorData;
    };

type TResponseResolver<TResponseData> = (
  ctx: RequestContext,
) => PromiseLike<TResolverResponse<TResponseData>>;

export function endpointHandler<TResponseData>(
  resolve: TResponseResolver<TResponseData>,
) {
  assertOnServer('endpointHandler');
  const handler: NextApiHandler<TResponseShape> = async (req, res) => {
    try {
      const ctx = {
        req,
        res,
      };

      const { data, statusCode = 200 } = await resolve(ctx);
      // res.setHeader('cache-control', 's-maxage=60, stale-while-revalidate');
      res.status(statusCode).json({ ok: true, data: serialize(data) });
    } catch (_err) {
      const error = getError(_err, 500);
      res.status(error.statusCode).json({
        ok: false,
        error,
      });
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

export interface EndpointSuccessResponse<TData> {
  ok: true;
  statusCode: number;
  data: TData;
}
export interface EndpointErrorResponse {
  ok: false;
  statusCode: number;
  error: TErrorData;
}
export type EndpointResponseEnvelope<TData> =
  | EndpointSuccessResponse<TData>
  | EndpointErrorResponse;

export type EndpointHandlerResponseEnvelope<TData> =
  | {
      ok: true;
      data: TData;
      statusCode?: number;
    }
  | {
      ok: false;
      statusCode?: number;
      error: TErrorData;
    };
export type EndpointHandlerResponse<
  TData
> = EndpointHandlerResponseEnvelope<TData>;

export type EndpointHandler<TData> = (
  ctx: RequestContext,
) => Promise<EndpointHandlerResponse<TData>>;

export type EndpointResolver<TData> = (
  ctx: RequestContext,
) => Promise<EndpointResponseEnvelope<TData>>;

function getAsEnvelope<TData>(
  val: EndpointHandlerResponse<TData>,
): EndpointHandlerResponseEnvelope<TData> {
  const envelope = val as EndpointHandlerResponseEnvelope<TData>;
  if (
    // check if the response is an envelope
    envelope &&
    typeof envelope === 'object' &&
    envelope &&
    !Array.isArray(envelope) &&
    typeof envelope.ok === 'boolean' &&
    'data' in envelope
  ) {
    return envelope;
  }
  return {
    ok: true,
    data: (val as unknown) as TData,
  };
}

function getErrorData(
  err: ErrorWithExtras,
  defaultStatusCode = 500,
): TErrorData {
  const res: TErrorData = {
    message: err.message,
    statusCode: parseIntOrNull(err.statusCode) ?? defaultStatusCode,
  };
  if (process.env.NODE_ENV === 'development') {
    res.stack = err.stack;
  }
  return res;
}
export function createAPIHandler<TData>(callback: EndpointHandler<TData>) {
  type ResponseEnvelope = EndpointResponseEnvelope<TData>;
  type ResolverResponse = FunctionThenArg<typeof callback>;
  function getResponseEnvelopeFromResolverResult(
    result: ResolverResponse,
  ): ResponseEnvelope {
    const envelope = getAsEnvelope<TData>(result);

    if (envelope.ok) {
      // resolved ok
      const { data, statusCode = 200 } = envelope;
      return {
        ok: true,
        statusCode,
        data,
      };
    }
    return {
      ok: false,
      statusCode: envelope.statusCode ?? 500,
      error: envelope.error,
    };
  }
  const handler = async (
    req: NextApiRequest,
    res: NextApiResponse<ResponseEnvelope>,
  ): Promise<ResponseEnvelope> => {
    try {
      const ctx = {
        req,
        res,
      };
      const result = getResponseEnvelopeFromResolverResult(await callback(ctx));

      res.status(result.statusCode).send(result);
      return result;
    } catch (_err) {
      // threw error
      const error = getErrorData(_err, 500);
      const result: EndpointErrorResponse = {
        ok: false,
        statusCode: error.statusCode,
        error,
      };
      res.status(result.statusCode).json(result);
      return result;
    }
  };
  return handler;
}
