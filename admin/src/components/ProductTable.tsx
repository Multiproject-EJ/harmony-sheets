import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Box, Chip, IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import type { ProductWithPrice } from '../lib/types'

type ProductTableProps = {
  products: ProductWithPrice[]
  loading: boolean
  onEdit: (product: ProductWithPrice) => void
}

export default function ProductTable({ products, loading, onEdit }: ProductTableProps) {
  const columns: GridColDef<ProductWithPrice>[] = [
    { field: 'name', headerName: 'Product', flex: 1 },
    {
      field: 'price',
      headerName: 'Price',
      flex: 1,
      valueGetter: (_value, row) =>
        row.price?.unit_amount
          ? `$${(row.price.unit_amount / 100).toFixed(2)} ${row.price.currency.toUpperCase()}`
          : '—'
    },
    {
      field: 'interval',
      headerName: 'Billing',
      flex: 1,
      valueGetter: (_value, row) => row.price?.interval ?? '—',
      renderCell: (params) =>
        params.value && params.value !== 'one_time' ? (
          <Chip label={params.value} size="small" color="primary" />
        ) : (
          <Chip label={params.value ?? 'one time'} size="small" variant="outlined" />
        )
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value === 'active' ? 'Active' : 'Archived'}
          color={params.value === 'active' ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: '',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton color="primary" onClick={() => onEdit(params.row)}>
          <EditIcon />
        </IconButton>
      )
    }
  ]

  return (
    <Box sx={{ height: 520, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
      <DataGrid
        rows={products}
        getRowId={(row) => row.id}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
      />
    </Box>
  )
}
