import React from 'react'
import { GetUsersResponse } from '../pages/api/users'

const ListItem = ({ data }: { data: GetUsersResponse[number] }) => (
  <>
    {data.id}: {data.name}
  </>
)

export default ListItem
