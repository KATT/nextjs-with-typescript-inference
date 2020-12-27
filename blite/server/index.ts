import { NextApiRequest, NextApiResponse } from 'next';
import { FunctionThenArg } from '../../types/typeUtils';

assertOnServer('server.ts');

export interface TErrorData {
  statusCode: number;
  message: string;
  stack?: string;
}

type TRequest = NextApiRequest;

type RequestContext = {
  req: TRequest;
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

function assertOnServer(desc?: string) {
  if (typeof window !== 'undefined') {
    throw new Error(
      'Imported server-only functionality on client' + desc ? ` (${desc})` : '',
    );
  }
}

interface EndpointSuccessResponse<TData> {
  ok: true;
  statusCode: number;
  data: TData;
}
interface EndpointErrorResponse {
  ok: false;
  statusCode: number;
  error: TErrorData;
}
type EndpointResponseEnvelope<TData> =
  | EndpointSuccessResponse<TData>
  | EndpointErrorResponse;

type EndpointHandlerResponseEnvelope<TData> =
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
type EndpointHandlerResponse<TData> = EndpointHandlerResponseEnvelope<TData>;

type EndpointHandler<TData> = (
  ctx: RequestContext,
) => Promise<EndpointHandlerResponse<TData>>;

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

// export function createAPIMutationHandler<
//   TSchema extends z.ZodObject<TSchemaShape>,
//   TSchemaShape extends ZodRawShape,
//   TData
// >({ schema, callback }: { schema: TSchema; callback: EndpointHandler<TData> }) {
//   type TValues = z.infer<TSchema>;
//   type ResponseEnvelope = EndpointResponseEnvelope<TData>;

//   const handler = async (
//     req: NextApiRequest,
//     res: NextApiResponse<ResponseEnvelope>,
//   ): Promise<ResponseEnvelope> => {
//     const ctx = {
//       req,
//       res,
//     };
//     const input = schema.safeParse(ctx.req.body);
//     if (input.success) {
//     }
//   };
//   return handler;
// }
