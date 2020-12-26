import React from 'react';
import { User } from '../types/typeUtils';

const ListItem = ({ data }: { data: Pick<User, 'id' | 'name'> }) => (
  <>
    {data.id}: {data.name}
  </>
);

export default ListItem;
