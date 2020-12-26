import sj from 'superjson';
import useSWR from 'swr';
import { TResponseShape } from './server';
import { BliteError } from './shared';

export async function jsonPost<TBody, TResponseData = unknown>(opts: {
  body: TBody;
  path: string;
}) {
  const res = await fetch(opts.path, {
    method: 'post',
    body: sj.stringify(opts.body),
    headers: {
      'content-type': 'application/json',
    },
  });
  const json: TResponseShape = await res.json();
  if (json.ok) {
    return {
      ok: true as const,
      data: sj.deserialize(json.data) as TResponseData,
    };
  }
  console.error('Error response:', json);
  throw new BliteError(json.error);
}

export async function swrFetcher<TResponseData>(path: string) {
  const res = await fetch(path, {
    method: 'get',
    headers: {
      'content-type': 'application/json',
    },
  });
  const json: TResponseShape = await res.json();
  if (json.ok) {
    return sj.deserialize(json.data) as TResponseData;
  }
  console.error('Error response:', json);
  throw new BliteError(json.error);
}

export function useAPI<TResponseData>(path: string) {
  const { data } = useSWR(path, () => swrFetcher<TResponseData>(path), {
    suspense: true,
    revalidateOnMount: true,
  });
  return data!;
}
