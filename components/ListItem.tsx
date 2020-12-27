import React from 'react';
import { User } from '../types/User';

const ListItem = ({ data }: { data: Pick<User, 'id' | 'name'> }) => (
  <>
    {data.id}: {data.name}
  </>
);

export default ListItem;
