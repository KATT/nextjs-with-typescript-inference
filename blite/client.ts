import { deserialize } from 'superjson';
import { TResponseShape } from './server';
import { BliteError } from './shared';

export async function jsonPost<TBody, TResponse = unknown>(opts: {
  body: TBody;
  path: string;
}) {
  const res = await fetch(opts.path, {
    method: 'post',
    body: JSON.stringify(opts.body),
    headers: {
      'content-type': 'application/json',
    },
  });
  const json: TResponseShape = await res.json();
  if (json.ok) {
    return {
      ok: true as const,
      data: deserialize(json.data) as TResponse,
    };
  }
  console.error('Error response:', json);
  throw new BliteError(json.error);
}
