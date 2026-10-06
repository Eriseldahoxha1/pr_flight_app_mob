import { fireEvent, screen } from '@testing-library/react-native'
import ConfirmDialog from '../../src/components/ConfirmDialog'
import { renderWithStore } from '../helpers/renderWithStore'

const renderDialog = (props: { visible?: boolean; isConfirming?: boolean } = {}) => {
  const onConfirm = jest.fn()
  const onCancel = jest.fn()

  renderWithStore(
    <ConfirmDialog
      visible={props.visible ?? true}
      title="Log out?"
      confirmLabel="Log out"
      confirmingLabel="Logging out…"
      isConfirming={props.isConfirming}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  )

  return { onConfirm, onCancel }
}

describe('ConfirmDialog', () => {
  it('is hidden when not visible', () => {
    renderDialog({ visible: false })

    expect(screen.queryByText('Log out?')).toBeNull()
  })

  it('confirms', () => {
    const { onConfirm, onCancel } = renderDialog()

    fireEvent.press(screen.getByText('Log out'))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('cancels', () => {
    const { onConfirm, onCancel } = renderDialog()

    fireEvent.press(screen.getByText('Cancel'))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('shows progress and cannot be cancelled while confirming', () => {
    const { onConfirm, onCancel } = renderDialog({ isConfirming: true })

    expect(screen.getByText('Logging out…')).toBeTruthy()

    fireEvent.press(screen.getByText('Cancel'))
    fireEvent.press(screen.getByText('Logging out…'))

    expect(onCancel).not.toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
