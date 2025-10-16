import { useMemo } from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Box, Chip, IconButton } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import EditIcon from '@mui/icons-material/Edit'
import type { ProductWithPrice } from '../lib/types'

type ProductTableProps = {
  products: ProductWithPrice[]
  loading: boolean
  onEdit?: (product: ProductWithPrice) => void
}

export default function ProductTable({ products, loading, onEdit }: ProductTableProps) {
  const theme = useTheme()
  const borderColor = alpha(theme.palette.primary.main, 0.12)
  const headerBackground = alpha(theme.palette.primary.main, 0.08)
  const rowHover = alpha(theme.palette.primary.main, 0.04)

  const columns: GridColDef<ProductWithPrice>[] = useMemo(() => {
    const baseColumns: GridColDef<ProductWithPrice>[] = [
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
      }
    ]

    if (onEdit) {
      baseColumns.push({
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
      })
    }

    return baseColumns
  }, [onEdit])

  return (
    <Box
      sx={{
        height: 520,
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        borderRadius: 3,
        border: '1px solid',
        borderColor,
        overflow: 'hidden',
        boxShadow: '0 20px 45px rgba(24, 39, 75, 0.08)',
        backdropFilter: 'blur(8px)',
        '& .MuiDataGrid-columnHeaders': {
          bgcolor: headerBackground,
          color: theme.palette.primary.main,
          fontWeight: 600
        },
        '& .MuiDataGrid-row:hover': {
          bgcolor: rowHover
        },
        '& .MuiDataGrid-cell': {
          borderColor: alpha(theme.palette.primary.main, 0.06)
        }
      }}
    >
      <DataGrid
        rows={products}
        getRowId={(row) => row.id}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        disableColumnMenu
        hideFooter
      />
    </Box>
  )
}
