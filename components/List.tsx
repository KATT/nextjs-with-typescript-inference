import * as React from 'react';
import { User } from '../types/User';
import ListItem from './ListItem';

const List = ({ items }: { items: User[] }) => (
  <ul>
    {items.map((item) => (
      <li key={item.id}>
        <ListItem data={item} />
      </li>
    ))}
  </ul>
);

export default List;
