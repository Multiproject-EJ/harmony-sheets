import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Divider,
  Drawer,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import InputAdornment from '@mui/material/InputAdornment'
import { createStripeProduct, updateStripePrice } from '../lib/stripeFunctions'
import type { ProductWithPrice } from '../lib/types'

type ProductDrawerProps = {
  open: boolean
  product: ProductWithPrice | null
  onClose: () => void
  onUpdated: () => void | Promise<void>
}

type BillingInterval = 'month' | 'year' | 'one_time'

const billingOptions: { label: string; value: BillingInterval }[] = [
  { label: 'One time', value: 'one_time' },
  { label: 'Monthly', value: 'month' },
  { label: 'Yearly', value: 'year' }
]

export default function ProductDrawer({ open, product, onClose, onUpdated }: ProductDrawerProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [interval, setInterval] = useState<BillingInterval>('one_time')
  const [currency, setCurrency] = useState('usd')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (product) {
      setName(product.name)
      setDescription(product.description ?? '')
      if (product.price?.unit_amount) {
        setPrice((product.price.unit_amount / 100).toFixed(2))
      } else {
        setPrice('')
      }
      setInterval(product.price?.interval ?? 'one_time')
      setCurrency(product.price?.currency ?? 'usd')
    } else {
      setName('')
      setDescription('')
      setPrice('')
      setInterval('one_time')
      setCurrency('usd')
    }
    setError(null)
    setSuccess(null)
  }, [product, open])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const amountCents = Math.round(Number(price) * 100)
      if (Number.isNaN(amountCents)) {
        setError('Enter a valid price value.')
        return
      }

      if (product) {
        await updateStripePrice({
          productId: product.id,
          priceId: product.price?.id,
          price: amountCents,
          currency,
          interval
        })
        setSuccess('Product updated successfully.')
      } else {
        await createStripeProduct({
          name,
          description,
          price: amountCents,
          currency,
          interval
        })
        setSuccess('Product created successfully.')
      }

      await onUpdated()
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 420, p: 3 } }}>
      <Stack component="form" spacing={3} onSubmit={handleSubmit}>
        <div>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {product ? 'Edit product' : 'Create new product'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sync updates across Supabase and Stripe instantly.
          </Typography>
        </div>

        <Divider />

        <Stack spacing={2}>
          <TextField label="Product name" value={name} onChange={(event) => setName(event.target.value)} required />
          <TextField
            label="Description"
            value={description}
            multiline
            minRows={3}
            onChange={(event) => setDescription(event.target.value)}
          />
          <TextField
            label="Price"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            required
          />
          <FormControl fullWidth>
            <InputLabel id="billing-label">Billing</InputLabel>
            <Select
              labelId="billing-label"
              label="Billing"
              value={interval}
              onChange={(event) => setInterval(event.target.value as BillingInterval)}
            >
              {billingOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value.toLowerCase())}
            inputProps={{ maxLength: 3, style: { textTransform: 'uppercase' } }}
          />
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Stack direction="row" spacing={2}>
          <Button variant="contained" type="submit" disabled={loading} fullWidth>
            {product ? 'Save changes' : 'Create product'}
          </Button>
          <Button variant="outlined" onClick={onClose} fullWidth>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  )
}
