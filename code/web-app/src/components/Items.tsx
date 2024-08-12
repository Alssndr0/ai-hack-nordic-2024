import React, { useState, useEffect } from 'react'
import { Title } from '@mantine/core';
import { useQuery, useMutation } from '@apollo/client'
import {
  ITEMS,
  ITEMS_CREATE,
  ITEMS_REMOVE,
  ITEMS_CREATED,
} from '../graphql/items'

interface Item {
  id: string
  name: string
}

interface GetItemsQuery {
  items: Item[]
}

const Items: React.FC = () => {
  const [newItemText, setNewItemText] = useState('')
  const { data, loading, error, subscribeToMore } = useQuery(ITEMS)
  const [addItem] = useMutation(ITEMS_CREATE, { errorPolicy: 'all' })
  const [removeItem] = useMutation(ITEMS_REMOVE)

  useEffect(() => {
    subscribeToMore({
      document: ITEMS_CREATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const newItem = subscriptionData.data.itemsCreated

        if (prev.items.some((item: Item) => item.id === newItem.id)) {
          return prev
        }
        return Object.assign({}, prev, {
          items: [...prev.items, newItem],
        })
      },
    })
  }, [subscribeToMore])

  if (loading)
    return (
      <div>
        Loading...
      </div>
    )
  //if (error) return <p>{'Error: ' + error}</p>

  const handleAddItem = async () => {
    if (!newItemText.trim()) return
    await addItem({ variables: { items: [{ name: newItemText }] } })
    setNewItemText('')
  }

  const handleRemoveItem = async (id: string) => {
    await removeItem({
      variables: { ids: [id] },
      update(cache) {
        const existingItems = cache.readQuery<GetItemsQuery>({ query: ITEMS })
        if (existingItems?.items) {
          cache.writeQuery({
            query: ITEMS,
            data: {
              items: existingItems.items.filter((item) => item.id !== id),
            },
          })
        }
      },
    })
  }

  return (
    <Title>wewewew</Title>
  )
}

export default Items
