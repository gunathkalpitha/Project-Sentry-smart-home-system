import React from 'react'
export default function Card({ title, children, footer }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      {title && <div className="text-sm text-gray-500 mb-2">{title}</div>}
      <div className="text-2xl font-semibold">{children}</div>
      {footer && <div className="mt-2 text-xs text-gray-500">{footer}</div>}
    </div>
  )
}
