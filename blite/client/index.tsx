// todo

// import useSWR from "swr";

// export async function swrFetcher<TResponseData>(path: string) {
//   const res = await fetch(path, {
//     method: 'get',
//     headers: {
//       'content-type': 'application/json',
//     },
//   });
//   const json: TResponseShape = await res.json();
//   if (json.ok) {
//     return sj.deserialize(json.data) as TResponseData;
//   }
//   console.error('Error response:', json);
//   throw new BliteError(json.error);
// }

// export function useQuery<TResponseData>(path: string) {
//   const { data } = useSWR(path, () => swrFetcher<TResponseData>(path), {
//     suspense: true,
//     revalidateOnMount: true,
//   });
//   return data!;
// }
