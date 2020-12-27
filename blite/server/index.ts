import { NextApiRequest, NextApiResponse } from 'next';
import { FunctionThenArg } from '../../types/typeUtils';
import * as z from 'zod';
import { ZodRawShape } from 'zod/lib/src/types/base';
import { ZodError } from 'zod';
import { IncomingMessage } from 'http';
assertOnServer('server.ts');
// shared
export interface TErrorData {
  statusCode: number;
  message: string;
  stack?: string;
}

type TRequest = IncomingMessage & {
  cookies?: { [key: string]: any };
};

interface QueryHandlerContext {
  req: TRequest;
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

function assertOnServer(desc?: string) {
  if (typeof window !== 'undefined') {
    throw new Error(
      'Imported server-only functionality on client' + desc ? ` (${desc})` : '',
    );
  }
}

type EndpointHandlerResponseEnvelope<TResolverData> =
  | {
      ok: true;
      data: TResolverData;
      statusCode?: number;
    }
  | {
      ok: false;
      statusCode?: number;
      error: TErrorData;
    };
// query
interface QueryEndpointSuccessResponse<TResolverData> {
  ok: true;
  statusCode: number;
  data: TResolverData;
}
interface QueryEndpointErrorResponse {
  ok: false;
  statusCode: number;
  error: TErrorData;
}
type QueryResponseEnvelope<TResolverData> =
  | QueryEndpointSuccessResponse<TResolverData>
  | QueryEndpointErrorResponse;

type QueryEndpointHandlerResponse<
  TResolverData
> = EndpointHandlerResponseEnvelope<TResolverData>;

type QueryEndpointHandler<TResolverData> = (
  ctx: QueryHandlerContext,
) => Promise<QueryEndpointHandlerResponse<TResolverData>>;

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

export function apiQueryHandler<TResolverData>(
  callback: QueryEndpointHandler<TResolverData>,
) {
  type THandlerRequestEnvelope = QueryResponseEnvelope<TResolverData>;
  type TQueryResolverResponse = FunctionThenArg<typeof callback>;
  function getEnvelope(
    result: TQueryResolverResponse,
  ): THandlerRequestEnvelope {
    const envelope = result;

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
    req: TRequest,
    res?: NextApiResponse<THandlerRequestEnvelope>,
  ): Promise<THandlerRequestEnvelope> => {
    try {
      const result = getEnvelope(await callback({ req }));
      res?.status(result.statusCode).send(result);
      return result;
    } catch (_err) {
      // threw error
      const error = getErrorData(_err, 500);
      const result: QueryEndpointErrorResponse = {
        ok: false,
        statusCode: error.statusCode,
        error,
      };
      res?.status(result.statusCode).json(result);
      return result;
    }
  };
  return handler;
}

// mutation
interface MutationEndpointErrorResponse<TInput>
  extends QueryEndpointErrorResponse {
  input: TInput;
}

interface MutationEndpointSucessResponse<TResolverData, TInput>
  extends QueryEndpointSuccessResponse<TResolverData> {
  input: TInput;
}

type MutationEndpointHandlerContext<TInput> = QueryHandlerContext & {
  input: TInput;
};

type MutationResponseEnvelope<TResolverData, TInput> =
  | MutationEndpointSucessResponse<TResolverData, TInput>
  | MutationEndpointErrorResponse<TInput>;

type MutationEndpointHandler<TResolverData, TInput> = (
  ctx: MutationEndpointHandlerContext<TInput>,
) => Promise<EndpointHandlerResponseEnvelope<TResolverData>>;

export function apiMutationHandler<
  TSchema extends z.ZodObject<TSchemaShape>,
  TSchemaShape extends ZodRawShape,
  TResolverData
>({
  schema,
  callback,
}: {
  schema: TSchema;
  callback: MutationEndpointHandler<TResolverData, z.infer<TSchema>>;
}) {
  type TValues = z.infer<TSchema>;
  type TMutationResponseEnvelope = MutationResponseEnvelope<
    TResolverData,
    TValues
  >;
  type TMutationEndpointHandlerConext = MutationEndpointHandlerContext<TValues>;
  type TResolverResponse = FunctionThenArg<typeof callback>;
  type TMutationRequestEnvelope = MutationResponseEnvelope<
    TResolverData,
    TValues
  >;

  function getEnvelope(
    result: TResolverResponse,
    ctx: TMutationEndpointHandlerConext,
  ): TMutationRequestEnvelope {
    const envelope = result;

    if (envelope.ok) {
      // resolved ok
      const { data, statusCode = 200 } = envelope;
      return {
        ok: true,
        statusCode,
        input: ctx.input,
        data,
      };
    }
    return {
      input: ctx.input,
      ok: false,
      statusCode: envelope.statusCode ?? 500,
      error: envelope.error,
    };
  }

  const handler = async (
    req: NextApiRequest,
    res: NextApiResponse<TMutationResponseEnvelope>,
  ): Promise<TMutationResponseEnvelope> => {
    const input = req.body;
    try {
      const parsed = schema.safeParse(input);
      if (parsed.success) {
        const ctx: TMutationEndpointHandlerConext = {
          req,
          input,
        };
        const result = await callback(ctx);
        const envelope = getEnvelope(result, ctx);
        res.status(envelope.statusCode).send(envelope);
        return envelope;
      }
      throw parsed.error;
    } catch (err) {
      if (err instanceof ZodError) {
        // validation error
        const envelope: TMutationResponseEnvelope = {
          ok: false,
          statusCode: 400,
          input,
          error: getErrorData(err),
        };
        res.status(400).send(envelope);
        return envelope;
      }
      // some other error
      const error = getErrorData(err);
      const envelope: TMutationResponseEnvelope = {
        ok: false,
        statusCode: error.statusCode,
        input,
        error,
      };
      res.status(400).send(envelope);
      return envelope;
    }
  };
  return handler;
}
