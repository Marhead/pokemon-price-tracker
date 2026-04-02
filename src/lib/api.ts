import type { Card, CardListResponse, CardSearchParams } from '../types/card'
import type { PricesResponse } from '../types/price'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function fetchCards(params: CardSearchParams): Promise<CardListResponse> {
  const searchParams = new URLSearchParams()
  if (params.q) searchParams.set('q', params.q)
  if (params.expansion) searchParams.set('expansion', params.expansion)
  if (params.rarity) searchParams.set('rarity', params.rarity)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.per_page) searchParams.set('per_page', String(params.per_page))

  const res = await fetch(`${API_BASE}/api/cards?${searchParams}`)
  if (!res.ok) throw new Error('카드 목록 조회 실패')
  return res.json() as Promise<CardListResponse>
}

export async function fetchCard(id: string): Promise<Card> {
  const res = await fetch(`${API_BASE}/api/cards/${id}`)
  if (!res.ok) throw new Error('카드 조회 실패')
  return res.json() as Promise<Card>
}

export async function fetchPrices(id: string): Promise<PricesResponse> {
  const res = await fetch(`${API_BASE}/api/cards/${id}/prices`)
  if (!res.ok) throw new Error('시세 조회 실패')
  return res.json() as Promise<PricesResponse>
}

export async function fetchExpansions(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/expansions`)
  if (!res.ok) throw new Error('확장팩 목록 조회 실패')
  return res.json() as Promise<string[]>
}
