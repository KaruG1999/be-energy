// Mock data para demo de BeEnergy

export const mockUser = {
  stockKwh: 87.5,
}

export const mockOffers = [
  {
    id: 1,
    seller: "G7Y3KML4RTH8PLQW5XN9ZV2F6J1K4L2",
    sellerShort: "G7Y3...K4L2",
    amount: 50,
    pricePerKwh: 0.5,
    total: 25,
  },
  {
    id: 2,
    seller: "F2M8PQW3NRT6YKL9XHV1ZJ4C5B7A8D9",
    sellerShort: "F2M8...A8D9",
    amount: 30,
    pricePerKwh: 0.48,
    total: 14.4,
  },
  {
    id: 3,
    seller: "H4K9LXC2VBN7TQW6PMZ3RF1J8Y5M4N3",
    sellerShort: "H4K9...M4N3",
    amount: 75,
    pricePerKwh: 0.52,
    total: 39,
  },
  {
    id: 4,
    seller: "P6R1WQX4JKL9NVB2THY8MZC5F3G7D2K",
    sellerShort: "P6R1...D2K",
    amount: 40,
    pricePerKwh: 0.49,
    total: 19.6,
  },
  {
    id: 5,
    seller: "M3N7YFG9QWX2PKL6RHV4JZC1TB8D5N9",
    sellerShort: "M3N7...D5N9",
    amount: 60,
    pricePerKwh: 0.51,
    total: 30.6,
  },
  {
    id: 6,
    seller: "L8T4VXN2HKW9JPQ5RMY6FCZ3GB1D7K4",
    sellerShort: "L8T4...D7K4",
    amount: 45,
    pricePerKwh: 0.47,
    total: 21.15,
  },
]

export function generateIdenticon(address: string): string {
  // Genera un color basado en el hash del address
  let hash = 0
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hash % 360
  return `hsl(${hue}, 65%, 55%)`
}
