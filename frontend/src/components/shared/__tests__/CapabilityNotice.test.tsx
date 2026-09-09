import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CapabilityNotice } from '../CapabilityNotice'
import type { CapabilityGateState } from '../../../hook/useCapabilityGate'

function gate(overrides: Partial<CapabilityGateState> = {}): CapabilityGateState {
  return {
    loading: false,
    capabilities: null,
    usage: undefined,
    failure: null,
    blocked: false,
    reason: null,
    refresh: vi.fn(),
    ...overrides,
  }
}

describe('CapabilityNotice', () => {
  it('explains why an exhausted quota blocks an action', () => {
    render(
      <CapabilityNotice
        gate={gate({
          blocked: true,
          reason: 'Bạn đã dùng hết lượt hôm nay.',
          usage: { limit: 20, used: 20, remaining: 0 },
        })}
        label="Phân tích ngữ cảnh"
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('đang tạm khóa')
    expect(screen.getByRole('alert')).toHaveTextContent('Bạn đã dùng hết lượt hôm nay.')
  })

  it('shows remaining usage and allows refreshing a failed capability read', () => {
    const refresh = vi.fn()
    const { rerender } = render(
      <CapabilityNotice
        gate={gate({
          usage: { limit: 20, used: 3, remaining: 17, resetAt: '2026-09-10T00:00:00Z' },
        })}
        label="Đánh giá Speaking"
      />
    )

    expect(screen.getByRole('status')).toHaveTextContent('17/20 lượt hôm nay')

    rerender(
      <CapabilityNotice
        gate={gate({
          failure: {
            kind: 'network',
            title: 'Không thể kết nối',
            message: 'Thử lại',
          },
          refresh,
        })}
        label="Đánh giá Speaking"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /tải lại/i }))
    expect(refresh).toHaveBeenCalledTimes(1)
  })
})
