/**
 * Inventory adjustment request modal.
 * Shows current stock, collects delta/reason details, and submits to the backend workflow API.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { X } from 'lucide-react'
import { useAdjustInventory, useAdjustmentReasonCodes } from '@/hooks/useAdjustInventory'
import type { Inventory } from '@/types/inventory'

interface InventoryAdjustModalProps {
  isOpen: boolean
  inventory: Inventory | null
  onClose: () => void
}

const SUCCESS_TOAST_ID = 'stockops-success-toast'
const SUCCESS_TOAST_DURATION_MS = 4000

let activeSuccessToastTimeout: number | undefined

/**
 * Shows a temporary success toast after the adjustment request is created.
 *
 * @param message - Message shown to the user
 * @returns Nothing
 */
function showSuccessToast(message: string): void {
  if (typeof document === 'undefined' || !document.body) {
    return
  }

  document.getElementById(SUCCESS_TOAST_ID)?.remove()

  const toast = document.createElement('div')
  toast.id = SUCCESS_TOAST_ID
  toast.setAttribute('role', 'status')
  toast.textContent = message

  Object.assign(toast.style, {
    position: 'fixed',
    left: '50%',
    bottom: '24px',
    transform: 'translateX(-50%)',
    zIndex: '9999',
    maxWidth: 'calc(100vw - 32px)',
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '500',
  } satisfies Partial<CSSStyleDeclaration>)

  document.body.appendChild(toast)

  if (activeSuccessToastTimeout !== undefined) {
    window.clearTimeout(activeSuccessToastTimeout)
  }

  activeSuccessToastTimeout = window.setTimeout(() => {
    document.getElementById(SUCCESS_TOAST_ID)?.remove()
    activeSuccessToastTimeout = undefined
  }, SUCCESS_TOAST_DURATION_MS)
}

/**
 * Returns a user-facing error message for failed adjustment requests.
 *
 * @param error - Unknown error thrown during submission
 * @returns User-facing failure message
 */
function getSubmitErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return '재고 조정 요청을 등록하지 못했습니다. 다시 시도해주세요.'
  }

  const responseMessage = error.response?.data && typeof error.response.data === 'object'
    ? Reflect.get(error.response.data, 'message')
    : null

  if (typeof responseMessage === 'string' && responseMessage.trim().length > 0) {
    return responseMessage
  }

  return '재고 조정 요청을 등록하지 못했습니다. 다시 시도해주세요.'
}

/**
 * Inventory-adjustment modal component.
 *
 * @param isOpen - Whether the modal is visible
 * @param inventory - Inventory row being adjusted
 * @param onClose - Close handler
 * @returns Modal JSX element or null
 */
export function InventoryAdjustModal({
  isOpen,
  inventory,
  onClose,
}: InventoryAdjustModalProps) {
  const [quantityDelta, setQuantityDelta] = useState('0')
  const [reasonCodeId, setReasonCodeId] = useState('')
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const { data: reasonCodes = [], isLoading: isReasonCodesLoading, error: reasonCodesError } = useAdjustmentReasonCodes()
  const adjustInventory = useAdjustInventory()

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!isOpen) {
      setQuantityDelta('0')
      setReasonCodeId('')
      setNote('')
      setFormError(null)
      return
    }

    setQuantityDelta('0')
    setReasonCodeId('')
    setNote('')
    setFormError(null)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isOpen, inventory?.id])

  const parsedDelta = Number.parseInt(quantityDelta, 10)
  const safeDelta = Number.isNaN(parsedDelta) ? 0 : parsedDelta
  const currentQuantity = inventory?.quantity ?? 0
  const projectedQuantity = currentQuantity + safeDelta

  const reasonCodeOptions = useMemo(
    () => reasonCodes.slice().sort((left, right) => left.name.localeCompare(right.name)),
    [reasonCodes],
  )

  if (!isOpen || !inventory) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (Number.isNaN(parsedDelta)) {
      setFormError('조정 수량은 정수로 입력해주세요.')
      return
    }

    if (projectedQuantity < 0) {
      setFormError('조정 후 재고는 0보다 작을 수 없습니다.')
      return
    }

    if (!reasonCodeId) {
      setFormError('조정 사유를 선택해주세요.')
      return
    }

    setFormError(null)

    try {
      await adjustInventory.mutateAsync({
        inventoryId: inventory.id,
        newQuantity: projectedQuantity,
        reasonCodeId: Number(reasonCodeId),
        note: note.trim() || undefined,
      })

      showSuccessToast('재고 조정 요청이 등록되었습니다.')
      onClose()
    } catch (error) {
      setFormError(getSubmitErrorMessage(error))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">재고 조정 요청</h2>
            <p className="mt-1 text-sm text-neutral-500">승인 워크플로우로 전송될 조정 수량과 사유를 입력하세요.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 transition-colors hover:bg-neutral-100"
            disabled={adjustInventory.isPending}
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        <div className="mb-6 grid gap-4 rounded-lg bg-neutral-50 p-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-neutral-500">상품</p>
            <p className="mt-1 font-semibold text-neutral-900">{inventory.productName}</p>
            <p className="text-sm text-neutral-500">{inventory.productBarcode}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">보관 위치</p>
            <p className="mt-1 font-semibold text-neutral-900">{inventory.locationCode}</p>
            <p className="text-sm text-neutral-500">{inventory.locationName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">LOT</p>
            <p className="mt-1 font-semibold text-neutral-900">{inventory.lotNumber}</p>
            <p className="text-sm text-neutral-500">유통기한 {new Date(inventory.expiryDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">현재 재고</p>
            <p className="mt-1 text-2xl font-bold text-neutral-900">{currentQuantity}</p>
            <p className={`text-sm ${projectedQuantity < 0 ? 'text-error' : 'text-primary-700'}`}>
              조정 후 재고 {projectedQuantity}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="quantityDelta" className="mb-1 block text-sm font-medium text-neutral-700">
              조정 수량 (+/-) <span className="text-error">*</span>
            </label>
            <input
              id="quantityDelta"
              type="number"
              step="1"
              value={quantityDelta}
              onChange={(event) => setQuantityDelta(event.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="예: 5 또는 -3"
              required
            />
            <p className="mt-1 text-xs text-neutral-500">현재 재고 {currentQuantity}에서 증감할 수량을 입력합니다.</p>
          </div>

          <div>
            <label htmlFor="reasonCodeId" className="mb-1 block text-sm font-medium text-neutral-700">
              조정 사유 <span className="text-error">*</span>
            </label>
            <select
              id="reasonCodeId"
              value={reasonCodeId}
              onChange={(event) => setReasonCodeId(event.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isReasonCodesLoading || adjustInventory.isPending}
              required
            >
              <option value="">사유를 선택하세요</option>
              {reasonCodeOptions.map((reasonCode) => (
                <option key={reasonCode.id} value={reasonCode.id}>
                  {reasonCode.name} ({reasonCode.code})
                </option>
              ))}
            </select>
            {reasonCodesError && (
              <p className="mt-1 text-sm text-error">조정 사유 목록을 불러오지 못했습니다.</p>
            )}
          </div>

          <div>
            <label htmlFor="note" className="mb-1 block text-sm font-medium text-neutral-700">메모</label>
            <textarea
              id="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              maxLength={500}
              placeholder="실사 결과나 조정 배경을 입력하세요."
              disabled={adjustInventory.isPending}
            />
          </div>

          {formError && (
            <div className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
              {formError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 transition-colors hover:bg-neutral-50"
              disabled={adjustInventory.isPending}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={adjustInventory.isPending || isReasonCodesLoading}
            >
              {adjustInventory.isPending ? '등록 중...' : '조정 요청 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
