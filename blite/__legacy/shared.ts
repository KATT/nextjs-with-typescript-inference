import { NextApiHandler } from 'next';
import { FunctionThenArg } from '../../types/typeUtils';
import { RequestContext } from './server';

export function throwServerOnlyError(message: string): never {
  throw new Error(`You have access server-only functionality (${message})`);
}

export interface TErrorData {
  statusCode: number;
  message: string;
  stack?: string;
}

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

export type EndpointHandlerResponse<TData> =
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

export type EndpointHandler<TData> = (
  ctx: RequestContext,
) => Promise<EndpointHandlerResponse<TData>>;

export type EndpointResolver<TData> = (
  ctx: RequestContext,
) => Promise<EndpointResponseEnvelope<TData>>;

export type InferResolverType<
  TResolver extends () => EndpointResolver<TData>,
  TData = any
> = FunctionThenArg<TResolver>;

export function createEndpoint<
  TEndpointHandler extends EndpointHandler<TData>,
  TData
>() {
  return {
    createAPIHandler(callback: TEndpointHandler) {
      if (!process.browser) {
        const handler: NextApiHandler<EndpointResponseEnvelope<TData>> = async (
          req,
          res,
        ) => {
          try {
            const ctx = {
              req,
              res,
            };

            const result = await callback(ctx);
            if (result.ok) {
              // resolved ok
              const { data, statusCode = 200 } = result;
              res.status(statusCode).send({
                ok: true,
                statusCode,
                data,
              });
              return;
            }
            // resolved with error
            const { statusCode = 500, error } = result;
            res.status(statusCode).send({
              ok: false,
              statusCode,
              error,
            });
          } catch (_err) {
            // threw error
            const error = getErrorData(_err, 500);
            res.status(error.statusCode).json({
              ok: false,
              statusCode: error.statusCode,
              error,
            });
          }
        };

        return handler;
      }
      throw throwServerOnlyError('createAPIHandler()');
    },
  };
}


export function create