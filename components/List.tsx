import * as React from 'react'
import { GetUsersResponse } from '../pages/api/users'
import ListItem from './ListItem'


const List = ({ items }: { items: GetUsersResponse }) => (
  <ul>
    {items.map((item) => (
      <li key={item.id}>
        <ListItem data={item} />
      </li>
    ))}
  </ul>
)

export default List
