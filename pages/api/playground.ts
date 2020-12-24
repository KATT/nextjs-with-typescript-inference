import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

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

function endpoint<TInput, TResolvedInput, TResponseData>(obj: {
  input: (
    input: TInput,
    ctx: Context,
  ) => PromiseLike<TResolvedInput> | TResolvedInput;
  resolve(
    input: TResolvedInput,
    ctx: Context,
  ): PromiseLike<ResolverResponse<TResponseData>>;
}) {
  const handler: NextApiHandler<TResponseShape<TResponseData>> = async (
    req,
    res,
  ) => {
    let resolvedInput: TResolvedInput;
    const ctx = {
      req,
      res,
    };
    try {
      resolvedInput = await obj.input(req.body, ctx);
    } catch (_err) {
      const err = getError(_err, 400);
      res.status(err.statusCode).send(err);
      return;
    }

    try {
      const { data, statusCode = 200 } = await obj.resolve(resolvedInput!, ctx);
      res.status(statusCode).json({ data });
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        message: err.message,
      });
      return;
    }
  };

  return handler;
}

export default endpoint({
  input() {
    return {
      foo: 'bar',
    };
  },
  async resolve(input, ctx) {
    return {
      data: {
        input,
        hello: 'world',
      },
    };
  },
});
