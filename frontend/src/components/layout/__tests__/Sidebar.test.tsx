import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from '../Sidebar'

describe('Sidebar', () => {
  it('renders main navigation links when expanded', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar
          isLight={false}
          onToggleTheme={vi.fn()}
          collapsed={false}
          onToggleCollapse={vi.fn()}
        />
      </MemoryRouter>
    )

    expect(screen.getByText('Hôm nay')).toBeInTheDocument()
    expect(screen.getByText('Luyện nói phản xạ')).toBeInTheDocument()
    expect(screen.getByText('Từ vựng & Cụm từ')).toBeInTheDocument()
    expect(screen.getByText('Tiến độ & Sổ lỗi')).toBeInTheDocument()
  })

  it('triggers onToggleCollapse when toggle button is clicked', () => {
    const handleToggle = vi.fn()
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar
          isLight={false}
          onToggleTheme={vi.fn()}
          collapsed={false}
          onToggleCollapse={handleToggle}
        />
      </MemoryRouter>
    )

    const toggleBtn = screen.getByRole('button', { name: /thu gọn thanh điều hướng/i })
    fireEvent.click(toggleBtn)
    expect(handleToggle).toHaveBeenCalledTimes(1)
  })

  it('triggers onToggleTheme when theme button is clicked', () => {
    const handleToggleTheme = vi.fn()
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar
          isLight={false}
          onToggleTheme={handleToggleTheme}
          collapsed={false}
          onToggleCollapse={vi.fn()}
        />
      </MemoryRouter>
    )

    const themeBtn = screen.getByRole('button', { name: /đổi giao diện sáng tối/i })
    fireEvent.click(themeBtn)
    expect(handleToggleTheme).toHaveBeenCalledTimes(1)
  })
})
