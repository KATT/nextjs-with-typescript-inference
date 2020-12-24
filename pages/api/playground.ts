import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { FunctionThenArg } from '../../types/typeUtils';

type Context = {
  req: NextApiRequest;
  res: NextApiResponse;
};

type ResolverResponse<TResponseData> = {
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
) => PromiseLike<ResolverResponse<TResponseData>>;

function endpoint<TResponseData>(obj: {
  resolve: TResponseResolver<TResponseData>;
}) {
  const handler: NextApiHandler<TResponseShape<TResponseData>> = async (
    req,
    res,
  ) => {
    try {
      const ctx = {
        req,
        res,
      };
      const { data, statusCode = 200 } = await obj.resolve(ctx);

      res.status(statusCode).json({ data });
    } catch (_err) {
      const err = getError(_err, 500);
      res.status(err.statusCode).json(err);
    }
  };

  return handler;
}

type InferGetDataFunction<T extends Function> = TResponseResolver<
  FunctionThenArg<T>
>;

// above is "framework"
// below is the actual function
async function exec() {
  return {
    foo: 'bar',
  };
}
const resolve: InferGetDataFunction<typeof exec> = async () => {
  const data = await exec();
  return {
    data,
  };
};

export type PlaygroundResponse = FunctionThenArg<typeof resolve>;

export default endpoint({ resolve });
